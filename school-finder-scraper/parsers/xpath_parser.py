from lxml import html
import re
from parsers.schema import SchoolSchema

class XPathParser:
    def __init__(self, config):
        self.config = config
        self.school_schema = SchoolSchema()
    
    def parse_school_list(self, content):
        """Parsowanie listy szkół z wykorzystaniem XPath"""
        tree = html.fromstring(content)
        
        # Przykładowe selektory XPath - należy dostosować do struktury strony MEN
        schools = []
        school_elements = tree.xpath('//div[contains(@class, "school-item")]')
        
        for element in school_elements:
            school = {}
            school['name'] = self._get_text(element, './/h3[@class="school-name"]')
            school['address'] = self._get_text(element, './/div[@class="school-address"]')
            school['type'] = self._get_text(element, './/span[@class="school-type"]')
            school['rspo'] = self._get_text(element, './/div[@class="school-id"]')
            school['url'] = self._get_attr(element, './/a[@class="school-details"]', 'href')
            
            # Walidacja i normalizacja danych
            validated_school = self.school_schema.validate(school)
            if validated_school:
                schools.append(validated_school)
        
        return schools
    
    def parse_school_details(self, content, base_data=None):
        """Parsowanie szczegółów szkoły z wykorzystaniem XPath"""
        tree = html.fromstring(content)
        
        school = base_data or {}
        
        # Pobieranie danych z różnych sekcji strony
        school['description'] = self._get_text(tree, '//div[@id="school-description"]')
        school['principal'] = self._get_text(tree, '//div[contains(@class, "principal-info")]')
        school['contact'] = {
            'phone': self._extract_phone(tree),
            'email': self._extract_email(tree),
            'website': self._get_attr(tree, '//a[contains(@class, "school-website")]', 'href')
        }
        
        # Pobieranie współrzędnych geograficznych
        lat = self._get_attr(tree, '//div[@data-lat]', 'data-lat')
        lng = self._get_attr(tree, '//div[@data-lng]', 'data-lng')
        if lat and lng:
            school['location'] = {
                'lat': float(lat),
                'lng': float(lng)
            }
        
        return school
    
    def _get_text(self, element, xpath, default=''):
        """Pobieranie tekstu z elementu za pomocą XPath"""
        nodes = element.xpath(xpath)
        if nodes and nodes[0].text_content().strip():
            return nodes[0].text_content().strip()
        return default
    
    def _get_attr(self, element, xpath, attr, default=''):
        """Pobieranie atrybutu z elementu za pomocą XPath"""
        nodes = element.xpath(xpath)
        if nodes and attr in nodes[0].attrib:
            return nodes[0].attrib[attr]
        return default
    
    def _extract_phone(self, tree):
        """Ekstrakcja numeru telefonu z treści strony"""
        phone_elements = tree.xpath('//div[contains(@class, "contact")]//text()')
        for text in phone_elements:
            # Regex dla polskich numerów telefonów
            match = re.search(r'(?:\+48|48)?\s*(?:\d{3}[\s-]?){3}', text)
            if match:
                return match.group(0).replace(' ', '').replace('-', '')
        return ''
    
    def _extract_email(self, tree):
        """Ekstrakcja adresu email z treści strony"""
        email_elements = tree.xpath('//a[contains(@href, "mailto:")]')
        if email_elements:
            href = email_elements[0].attrib['href']
            return href.replace('mailto:', '').strip()
        return ''