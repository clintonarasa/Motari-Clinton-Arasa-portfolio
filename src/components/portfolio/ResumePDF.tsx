import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Link } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { supabase } from '@/integrations/neon/client';

// Create styles for the PDF (This uses a React-Native-like styling system)
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  header: { marginBottom: 20, borderBottom: '1 solid #e2e8f0', paddingBottom: 10 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 5 },
  title: { fontSize: 14, color: '#3b82f6', marginBottom: 5 },
  contactRow: { flexDirection: 'row', gap: 10, fontSize: 10, color: '#64748b' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginTop: 15, marginBottom: 8, textTransform: 'uppercase' },
  item: { marginBottom: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemTitle: { fontSize: 12, fontWeight: 'bold', color: '#1e293b' },
  itemSubtitle: { fontSize: 10, color: '#64748b' },
  text: { fontSize: 10, color: '#334155', lineHeight: 1.5 },
  skillsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 5 },
  skill: { fontSize: 10, color: '#334155', backgroundColor: '#f1f5f9', padding: '3 6', borderRadius: 4 },
});

// Add a prop interface so we can pass our custom brand color
interface ResumeDocumentProps {
  accentColor?: string;
  experience?: any[];
  userId?: string;
}

// The actual PDF Document layout
const ResumeDocument = ({ accentColor = '#3b82f6', experience = [] }: ResumeDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>Clinton Arasa</Text>
        <Text style={[styles.title, { color: accentColor }]}>Senior Full-Stack Developer & Cloud Architect</Text>
        <View style={styles.contactRow}>
          <Text>clinton@example.com</Text>
          <Text>•</Text>
          <Link src="https://github.com/clinton">github.com/clinton</Link>
          <Text>•</Text>
          <Text>Nairobi, Kenya</Text>
        </View>
      </View>

      <View>
        <Text style={styles.sectionTitle}>Experience</Text>
        {experience.length > 0 ? experience.map((exp, idx) => (
          <View style={styles.item} key={idx}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{exp.title} @ {exp.company}</Text>
              <Text style={styles.itemSubtitle}>
                {new Date(exp.start_date).getFullYear()} - {exp.current_role ? 'Present' : new Date(exp.end_date).getFullYear()}
              </Text>
            </View>
            <Text style={styles.text}>- {exp.description}</Text>
          </View>
        )) : (
          <Text style={styles.text}>Loading experience...</Text>
        )}
      </View>

      <View>
        <Text style={styles.sectionTitle}>Core Skills</Text>
        <View style={styles.skillsWrapper}>
          <Text style={styles.skill}>React / Next.js</Text>
          <Text style={styles.skill}>TypeScript</Text>
          <Text style={styles.skill}>Node.js</Text>
          <Text style={styles.skill}>Tailwind CSS</Text>
          <Text style={styles.skill}>Neon PostgreSQL</Text>
        </View>
      </View>
    </Page>
  </Document>
);

// The highly styled download button to place on your UI
export const PDFDownloadButton = ({ accentColor = '#3b82f6', userId }: ResumeDocumentProps) => {
  const [experience, setExperience] = useState<any[]>([]);

  useEffect(() => {
    const fetchExperience = async () => {
      let query = supabase.from('experience').select('*').order('start_date', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      
      const { data } = await query;
      if (data) setExperience(data);
    };
    fetchExperience();
  }, [userId]);

  return (
    <PDFDownloadLink 
      document={<ResumeDocument accentColor={accentColor} experience={experience} />} 
      fileName="Clinton_Arasa_Resume.pdf"
      className="inline-flex items-center justify-center px-6 py-3 text-white rounded-lg font-medium transition-all shadow-lg active:scale-95"
      style={{ backgroundColor: accentColor }}
    >
      {({ loading }) => (
        <><Download className="w-5 h-5 mr-2" /> {loading ? 'Generating PDF...' : 'Download Resume (PDF)'}</>
      )}
    </PDFDownloadLink>
  );
};