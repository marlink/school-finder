import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Button,
  Img,
  Hr,
  Preview,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  userName?: string;
  userEmail?: string;
  loginUrl?: string;
}

export function WelcomeEmail({
  userName = 'there',
  userEmail = '',
  loginUrl = 'https://schoolfinder.com/auth/signin',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to School Finder - Your journey to finding the perfect school starts here!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://schoolfinder.com/logo.png"
              width="40"
              height="40"
              alt="School Finder"
              style={logo}
            />
            <Text style={headerText}>School Finder</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={title}>Welcome to School Finder! 🎓</Text>
            
            <Text style={paragraph}>
              Hi {userName},
            </Text>
            
            <Text style={paragraph}>
              Thank you for joining School Finder! We're excited to help you discover the perfect 
              educational opportunities for your needs. Whether you're looking for elementary schools, 
              high schools, or specialized programs, we've got you covered.
            </Text>

            {/* Features Section */}
            <Section style={featuresSection}>
              <Text style={featuresTitle}>What you can do with School Finder:</Text>
              
              <div style={featureItem}>
                <Text style={featureIcon}>🔍</Text>
                <div>
                  <Text style={featureTitle}>Smart Search</Text>
                  <Text style={featureDescription}>
                    Find schools by location, type, ratings, and specific criteria
                  </Text>
                </div>
              </div>

              <div style={featureItem}>
                <Text style={featureIcon}>📍</Text>
                <div>
                  <Text style={featureTitle}>Interactive Maps</Text>
                  <Text style={featureDescription}>
                    Explore schools on detailed maps with directions and nearby amenities
                  </Text>
                </div>
              </div>

              <div style={featureItem}>
                <Text style={featureIcon}>❤️</Text>
                <div>
                  <Text style={featureTitle}>Save Favorites</Text>
                  <Text style={featureDescription}>
                    Keep track of schools you're interested in for easy comparison
                  </Text>
                </div>
              </div>

              <div style={featureItem}>
                <Text style={featureIcon}>⭐</Text>
                <div>
                  <Text style={featureTitle}>Reviews & Ratings</Text>
                  <Text style={featureDescription}>
                    Read authentic reviews from parents and students
                  </Text>
                </div>
              </div>
            </Section>

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Button style={button} href={loginUrl}>
                Start Exploring Schools
              </Button>
            </Section>

            <Text style={paragraph}>
              We've also prepared a quick tour to help you get familiar with all the features. 
              You'll see this when you first log in, but you can always access it later from 
              your profile settings.
            </Text>

            <Hr style={hr} />

            {/* Tips Section */}
            <Section style={tipsSection}>
              <Text style={tipsTitle}>Quick Tips to Get Started:</Text>
              
              <Text style={tipItem}>
                1. <strong>Complete your profile</strong> - This helps us provide better recommendations
              </Text>
              <Text style={tipItem}>
                2. <strong>Set your search preferences</strong> - Define your ideal school criteria
              </Text>
              <Text style={tipItem}>
                3. <strong>Explore your area</strong> - Start with schools near your location
              </Text>
              <Text style={tipItem}>
                4. <strong>Save favorites</strong> - Build a list of schools to compare
              </Text>
              <Text style={tipItem}>
                5. <strong>Read reviews</strong> - Get insights from the school community
              </Text>
            </Section>

            <Hr style={hr} />

            <Text style={paragraph}>
              If you have any questions or need help getting started, don't hesitate to reach out. 
              Our support team is here to help you make the best educational decisions.
            </Text>

            <Text style={paragraph}>
              Happy school hunting!<br />
              The School Finder Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this email because you signed up for School Finder.
            </Text>
            <Text style={footerText}>
              <Link href="https://schoolfinder.com/unsubscribe" style={footerLink}>
                Unsubscribe
              </Link>
              {' | '}
              <Link href="https://schoolfinder.com/privacy" style={footerLink}>
                Privacy Policy
              </Link>
              {' | '}
              <Link href="https://schoolfinder.com/support" style={footerLink}>
                Support
              </Link>
            </Text>
            <Text style={footerText}>
              School Finder, 123 Education St, Learning City, LC 12345
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '20px 30px',
  backgroundColor: '#3b82f6',
  borderRadius: '8px 8px 0 0',
  display: 'flex',
  alignItems: 'center',
};

const logo = {
  marginRight: '12px',
};

const headerText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0',
};

const content = {
  padding: '30px',
};

const title = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '0 0 30px',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const featuresSection = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};

const featuresTitle = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 20px',
};

const featureItem = {
  display: 'flex',
  alignItems: 'flex-start',
  margin: '16px 0',
};

const featureIcon = {
  fontSize: '20px',
  marginRight: '12px',
  marginTop: '2px',
};

const featureTitle = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const featureDescription = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
  lineHeight: '1.4',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  border: 'none',
  cursor: 'pointer',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const tipsSection = {
  margin: '24px 0',
};

const tipsTitle = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const tipItem = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '8px 0',
};

const footer = {
  padding: '20px 30px',
  backgroundColor: '#f9fafb',
  borderTop: '1px solid #e5e7eb',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '1.4',
  margin: '8px 0',
};

const footerLink = {
  color: '#3b82f6',
  textDecoration: 'none',
};

export default WelcomeEmail;