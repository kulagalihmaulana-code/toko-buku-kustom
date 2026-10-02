import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STATUS_CONFIG: Record<
  string,
  {
    subject: (title: string) => string;
    emoji: string;
    heading: string;
    message: string;
    color: string;
    bgColor: string;
    cta?: string;
  }
> = {
  received: {
    subject: (t) => `📥 Naskah "${t}" Sudah Kami Terima`,
    emoji: '📥',
    heading: 'Naskah Anda Sudah Kami Terima',
    message:
      'Terima kasih telah mempercayakan naskah Anda kepada Mustawa Publishing. Tim editor kami akan meninjau naskah Anda dalam 3-7 hari kerja.',
    color: '#0284c7',
    bgColor: '#f0f9ff',
  },
  reviewing: {
    subject: (t) => `🔍 Naskah "${t}" Sedang Direview`,
    emoji: '🔍',
    heading: 'Naskah Anda Sedang Direview',
    message:
      'Tim editor kami sedang meninjau naskah Anda dengan teliti. Kami akan menginformasikan hasil review secepatnya.',
    color: '#d97706',
    bgColor: '#fffbeb',
  },
  accepted: {
    subject: (t) => `✅ Selamat! Naskah "${t}" Diterima`,
    emoji: '✅',
    heading: 'Selamat! Naskah Anda Diterima',
    message:
      'Kabar baik! Naskah Anda telah lolos seleksi internal Mustawa Publishing. Tim kami akan segera menghubungi Anda untuk proses penerbitan selanjutnya.',
    color: '#059669',
    bgColor: '#ecfdf5',
  },
  rejected: {
    subject: (t) => `Update Status Naskah "${t}"`,
    emoji: '📝',
    heading: 'Update Status Naskah Anda',
    message:
      'Terima kasih telah mengirimkan naskah Anda. Setelah review yang cermat, mohon maaf naskah Anda belum dapat kami terbitkan saat ini. Kami sangat menghargai usaha Anda dan mengundang Anda untuk mengirimkan karya lain di masa depan.',
    color: '#dc2626',
    bgColor: '#fef2f2',
  },
  published: {
    subject: (t) => `🎉 Buku "${t}" Sudah Terbit!`,
    emoji: '🎉',
    heading: 'Buku Anda Sudah Terbit!',
    message:
      'Alhamdulillah! Buku Anda telah resmi diterbitkan oleh Mustawa Publishing. Buku Anda sekarang dapat dilihat dan dibeli di katalog kami.',
    color: '#7c3aed',
    bgColor: '#faf5ff',
    cta: 'Lihat Buku di Katalog',
  },
};

export async function POST(req: Request) {
  try {
    const { submissionId, newStatus } = await req.json();

    if (!submissionId || !newStatus) {
      return NextResponse.json(
        { error: 'submissionId dan newStatus wajib diisi' },
        { status: 400 }
      );
    }

    const config = STATUS_CONFIG[newStatus];
    if (!config) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      );
    }

    // Ambil data submission
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json(
        { error: 'Naskah tidak ditemukan' },
        { status: 404 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://toko-buku-kustom.vercel.app';

    // Kirim email
    const { error: emailError } = await resend.emails.send({
      from: 'Mustawa Publishing <onboarding@resend.dev>',
      to: [submission.author_email],
      subject: config.subject(submission.book_title),
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
          <div style="background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: white; font-size: 24px; margin: 0; font-weight: 700;">
                MUSTAWA PUBLISHING
              </h1>
              <p style="color: #d1fae5; font-size: 12px; margin: 8px 0 0 0; letter-spacing: 1px;">
                TEMPAT GAGASAN MULIA MULAI DITULISKAN
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 32px 24px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="font-size: 56px; margin-bottom: 16px;">${config.emoji}</div>
                <h2 style="color: #0f172a; font-size: 22px; margin: 0 0 8px 0; font-weight: 700;">
                  ${config.heading}
                </h2>
              </div>

              <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                Halo <strong>${submission.author_name}</strong>,
              </p>

              <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                ${config.message}
              </p>

              <!-- Box Naskah -->
              <div style="background: ${config.bgColor}; border: 1px solid ${config.color}40; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 600; margin: 0 0 4px 0; letter-spacing: 0.5px;">
                  Kode Naskah
                </p>
                <p style="color: #0f172a; font-size: 18px; font-weight: 700; font-family: 'Courier New', monospace; margin: 0 0 16px 0;">
                  ${submission.submission_code}
                </p>

                <p style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 600; margin: 0 0 4px 0; letter-spacing: 0.5px;">
                  Judul Buku
                </p>
                <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0;">
                  ${submission.book_title}
                </p>
              </div>

              ${
                submission.admin_notes
                  ? `
                <div style="background: #f1f5f9; border-left: 4px solid ${config.color}; padding: 16px; border-radius: 8px; margin: 24px 0;">
                  <p style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 600; margin: 0 0 8px 0; letter-spacing: 0.5px;">
                    📝 Catatan dari Editor
                  </p>
                  <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-line;">
                    ${submission.admin_notes}
                  </p>
                </div>
              `
                  : ''
              }

              <!-- CTA -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${baseUrl}/cek-naskah?code=${submission.submission_code}" 
                   style="display: inline-block; background: ${config.color}; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  🔍 Cek Status Naskah
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />

              <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                Ada pertanyaan? Hubungi kami di<br />
                <a href="mailto:mustawa.publishing@gmail.com" style="color: #059669; text-decoration: none; font-weight: 600;">
                  mustawa.publishing@gmail.com
                </a>
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #0f172a; padding: 24px; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0 0 8px 0;">
                © ${new Date().getFullYear()} Mustawa Publishing
              </p>
              <p style="color: #64748b; font-size: 10px; margin: 0; line-height: 1.5;">
                Catatan Penting: Mustawa Publishing adalah penerbit resmi yang terdaftar di Perpustakaan Nasional RI.
                Layanan pengurusan ISBN diberikan secara gratis sebagai fasilitas dari pemerintah bagi setiap naskah
                yang memenuhi syarat dan lolos seleksi internal untuk diterbitkan oleh kami.
                <strong style="color: #f87171;">Kami tidak memperjualbelikan nomor ISBN.</strong>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return NextResponse.json(
        { error: 'Gagal kirim email: ' + emailError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email terkirim ke ' + submission.author_email,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}