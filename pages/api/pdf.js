// This API route fetches PDFs from Firestore (not Firebase Storage)
import { db } from '../../firebase/config'; // Adjust path to your firebase config
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch PDFs from Firestore subjects collection
    const subjectsRef = collection(db, 'subjects');
    const subjectsSnapshot = await getDocs(subjectsRef);

    const allPdfs = [];

    // Get all PDFs from all subjects
    for (const subjectDoc of subjectsSnapshot.docs) {
      const subjectData = subjectDoc.data();
      const pdfsRef = collection(db, 'subjects', subjectDoc.id, 'pdfs');
      const pdfsSnapshot = await getDocs(query(pdfsRef, orderBy('uploadedAt', 'desc')));

      pdfsSnapshot.docs.forEach((pdfDoc) => {
        const pdfData = pdfDoc.data();
        allPdfs.push({
          id: pdfDoc.id,
          name: pdfData.name,
          title: pdfData.name.replace('.pdf', '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          url: pdfData.url,
          size: pdfData.size,
          createdAt: pdfData.uploadedAt?.toDate?.() || new Date(pdfData.uploadedAt),
          updatedAt: pdfData.uploadedAt?.toDate?.() || new Date(pdfData.uploadedAt),
          contentType: 'application/pdf',
          pages: null,
          subject: subjectData.name,
          subjectId: subjectDoc.id,
          description: `PDF document: ${pdfData.name.replace('.pdf', '').replace(/[-_]/g, ' ')}`,
          fullPath: pdfData.url,
          bucket: 'cloudinary',
          customMetadata: {
            uploadedBy: pdfData.uploadedBy,
            cloudinaryId: pdfData.cloudinaryId
          }
        });
      });
    }

    // Sort by upload date (newest first)
    allPdfs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // List all files in the pdfs folder
    const result = await listAll(pdfsRef);
    
    // Get download URLs and metadata for each file
    const pdfPromises = result.items.map(async (itemRef, index) => {
      try {
        const [downloadURL, metadata] = await Promise.all([
          getDownloadURL(itemRef),
          getMetadata(itemRef)
        ]);

        return {
          id: index + 1,
          name: itemRef.name.replace('.pdf', ''),
          title: itemRef.name.replace('.pdf', '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          url: downloadURL,
          size: metadata.size,
          createdAt: metadata.timeCreated,
          updatedAt: metadata.updated,
          contentType: metadata.contentType,
          pages: null, // Firebase doesn't provide page count
          subject: extractSubjectFromFilename(itemRef.name),
          description: `PDF document: ${itemRef.name.replace('.pdf', '').replace(/[-_]/g, ' ')}`,
          fullPath: itemRef.fullPath,
          bucket: metadata.bucket,
          // Add any custom metadata you've set
          customMetadata: metadata.customMetadata || {}
        };
      } catch (error) {
        console.error(`Error processing file ${itemRef.name}:`, error);
        return null;
      }
    });

    res.status(200).json(allPdfs);
  } catch (error) {
    console.error('Error fetching PDFs from Firestore:', error);
    res.status(500).json({
      message: 'Error fetching PDFs',
      error: error.message
    });
  }
}

function extractSubjectFromFilename(filename) {
  const name = filename.toLowerCase();
  
  if (name.includes('current') && name.includes('affairs')) return 'Current Affairs';
  if (name.includes('math') || name.includes('mathematics')) return 'Mathematics';
  if (name.includes('science')) return 'Science';
  if (name.includes('history')) return 'History';
  if (name.includes('english')) return 'English';
  if (name.includes('physics')) return 'Physics';
  if (name.includes('chemistry')) return 'Chemistry';
  if (name.includes('biology')) return 'Biology';
  if (name.includes('geography')) return 'Geography';
  if (name.includes('economics')) return 'Economics';
  if (name.includes('political')) return 'Political Science';
  
  return 'General';
}