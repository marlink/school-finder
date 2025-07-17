/**
 * Parser XPath dla scrapera
 * 
 * Klasa do parsowania stron HTML przy użyciu XPath
 */

import { DOMParser } from 'xmldom';
import { select, select1 } from 'xpath';
import { Logger, setupLogger } from '../utils/logger';
import { ScraperConfig } from '../index';

export class XPathParser {
  private logger: Logger;
  
  constructor(config: ScraperConfig) {
    this.logger = setupLogger(config.logLevel);
  }
  
  /**
   * Parsowanie HTML do dokumentu DOM
   */
  parseHTML(html: string): Document {
    try {
      const parser = new DOMParser({
        errorHandler: {
          warning: () => {},
          error: () => {},
          fatalError: (e) => { this.logger.error(`Fatal error parsing HTML: ${e}`); }
        }
      });
      
      return parser.parseFromString(html, 'text/html');
    } catch (error) {
      this.logger.error(`Failed to parse HTML: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Wybieranie pojedynczego elementu przy użyciu XPath
   */
  select(document: Document, xpath: string): Node | null {
    try {
      return select1(xpath, document) as Node;
    } catch (error) {
      this.logger.error(`XPath selection failed for '${xpath}': ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
  
  /**
   * Wybieranie wielu elementów przy użyciu XPath
   */
  selectAll(document: Document, xpath: string): Node[] {
    try {
      return select(xpath, document) as Node[];
    } catch (error) {
      this.logger.error(`XPath selection failed for '${xpath}': ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }
  
  /**
   * Pobieranie tekstu z elementu
   */
  getText(node: Node | null): string {
    if (!node) return '';
    
    try {
      return (node as any).textContent?.trim() || '';
    } catch (error) {
      this.logger.error(`Failed to get text from node: ${error instanceof Error ? error.message : String(error)}`);
      return '';
    }
  }
  
  /**
   * Pobieranie atrybutu z elementu
   */
  getAttribute(node: Node | null, attributeName: string): string {
    if (!node) return '';
    
    try {
      return (node as Element).getAttribute(attributeName) || '';
    } catch (error) {
      this.logger.error(`Failed to get attribute '${attributeName}' from node: ${error instanceof Error ? error.message : String(error)}`);
      return '';
    }
  }
  
  /**
   * Pobieranie tekstu z elementu wybranego przez XPath
   */
  getTextByXPath(document: Document, xpath: string): string {
    const node = this.select(document, xpath);
    return this.getText(node);
  }
  
  /**
   * Pobieranie atrybutu z elementu wybranego przez XPath
   */
  getAttributeByXPath(document: Document, xpath: string, attributeName: string): string {
    const node = this.select(document, xpath);
    return this.getAttribute(node, attributeName);
  }
  
  /**
   * Pobieranie tekstów z wielu elementów wybranych przez XPath
   */
  getTextsByXPath(document: Document, xpath: string): string[] {
    const nodes = this.selectAll(document, xpath);
    return nodes.map(node => this.getText(node)).filter(text => text.length > 0);
  }
}