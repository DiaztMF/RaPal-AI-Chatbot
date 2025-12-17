import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: `
PERAN KAMU:
Kamu adalah chatbot resmi jurusan RPL (Rekayasa Perangkat Lunak)
SMK Negeri 2 Surakarta bernama "RAPal AI".

ATURAN WAJIB:
1. JANGAN memberikan definisi RPL secara umum seperti buku atau artikel internet.
2. JANGAN menggunakan kata "mahasiswa" (gunakan "siswa").
3. SEMUA jawaban HARUS dikaitkan dengan:
   - Jurusan RPL SMK Negeri 2 Surakarta
   - Kegiatan pembelajaran di SMK
   - Lingkungan sekolah dan dunia industri
4. Gunakan bahasa yang:
   - Informatif dan friendly
   - Tidak terlalu akademik
   - Cocok untuk siswa SMP/SMK dan orang tua
5. Jika ditanya tentang hal di luar konteks RPL, dengan sopan arahkan kembali ke topik RPL

KONTEKS RPL SMKN 2 SURAKARTA:
- RPL adalah jurusan yang fokus pada pengembangan software berbasis industri
- Pembelajaran mencakup web development, backend API, database, mobile, dan dasar UI/UX
- Jurusan RPL SMKN 2 Surakarta memiliki prestasi di bidang teknologi dan lomba IT
- Menyiapkan siswa untuk kerja, magang (PKL), lomba, dan kuliah di bidang teknologi
- Lulusan RPL bisa bekerja sebagai Web Developer, Backend Developer, Mobile Developer, atau lanjut kuliah IT

MATA PELAJARAN UTAMA:
- Pemrograman Web (HTML, CSS, JavaScript, PHP)
- Database (MySQL, PostgreSQL)
- Pemrograman Berorientasi Objek
- Backend Development (Node.js, Express, Laravel)
- Mobile Development (Android, Flutter)
- UI/UX Design Dasar
- Project Management

FASILITAS:
- Lab komputer dengan spesifikasi development
- Software development tools (VS Code, XAMPP, dll)
- Akses internet untuk pembelajaran online
- Bimbingan project dari guru berpengalaman

CONTOH JAWABAN YANG DIINGINKAN:
Pertanyaan: "Apa itu RPL?"
Jawaban:
"Jurusan RPL di SMK Negeri 2 Surakarta adalah jurusan yang
mempelajari pembuatan aplikasi dan website yang dibutuhkan dunia industri.
Siswa RPL tidak hanya belajar coding, tetapi juga membuat project nyata
seperti sistem informasi, API, dan aplikasi berbasis web.

Di RPL SMKN 2 Surakarta, kamu akan belajar:
- Membuat website dari nol
- Mengembangkan aplikasi mobile
- Mengelola database
- Bekerja dalam tim project
- Dan masih banyak lagi!

Lulusannya bisa langsung kerja atau lanjut kuliah IT."

Jika ada pertanyaan umum, SELALU spesifikkan ke RPL SMK Negeri 2 Surakarta.
Berikan jawaban yang lengkap, mudah dipahami, dan memotivasi.
`
});

// Store chat sessions in memory (will reset on cold start)
const chatSessions = new Map();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Parse URL path
  const path = req.url?.split('?')[0] || '';
  
  // Health check endpoint
  if (path.includes('/health') || (req.method === 'GET' && path === '/api')) {
    return res.status(200).json({ 
      status: "OK", 
      timestamp: new Date().toISOString(),
      sessions: chatSessions.size
    });
  }

  // Chat endpoint
  if (req.method === 'POST' && (path.includes('/chat') || path === '/api')) {
    try {
      const { message, sessionId = "default" } = req.body;

      // Validasi input
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ 
          reply: "Pesan tidak valid. Silakan kirim pesan yang benar." 
        });
      }

      if (message.trim().length === 0) {
        return res.status(400).json({ 
          reply: "Pesan tidak boleh kosong." 
        });
      }

      if (message.length > 5000) {
        return res.status(400).json({ 
          reply: "Pesan terlalu panjang. Maksimal 5000 karakter." 
        });
      }

      // Get or create chat session
      let session = chatSessions.get(sessionId);
      
      if (!session) {
        const chatSession = model.startChat({
          history: [],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        });
        
        session = {
          chat: chatSession,
          lastActivity: Date.now(),
          messageCount: 0
        };
        
        chatSessions.set(sessionId, session);
      }

      // Update last activity
      session.lastActivity = Date.now();
      session.messageCount++;

      // Rate limiting
      if (session.messageCount > 100) {
        return res.status(429).json({ 
          reply: "Terlalu banyak pesan. Silakan tunggu beberapa saat." 
        });
      }

      // Send message
      const result = await session.chat.sendMessage(message);
      const response = result.response.text();

      return res.status(200).json({ 
        reply: response,
        sessionId: sessionId 
      });

    } catch (error) {
      console.error("ERROR GEMINI:", error);
      
      if (error.message?.includes('quota')) {
        return res.status(503).json({
          reply: "Maaf, sistem sedang sibuk. Silakan coba lagi dalam beberapa saat."
        });
      }
      
      if (error.message?.includes('safety')) {
        return res.status(400).json({
          reply: "Maaf, pesan Anda tidak dapat diproses karena melanggar kebijakan konten."
        });
      }

      return res.status(500).json({
        reply: "Maaf, terjadi kesalahan pada sistem. Silakan coba lagi."
      });
    }
  }

  // 404 for other routes
  return res.status(404).json({ 
    error: "Endpoint tidak ditemukan",
    path: path
  });
}