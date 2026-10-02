import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId wajib diisi' },
        { status: 400 }
      );
    }

    // Ambil data order
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    if (!order.tracking_number) {
      return NextResponse.json(
        { error: 'Nomor resi belum diisi' },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://toko-buku-kustom-t4mr.vercel.app';

    // Kirim email
    const { error: emailError } = await resend.emails.send({
      from: 'Mustawa Publishing <onboarding@resend.dev>',
      to: [order.customer_email],
      subject: `🚚 Buku Anda Sedang Dikirim — Order #${orderId}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
          <div style="background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: 1px;">
                MUSTAWA PUBLISHING
              </h1>
            </div>

            <!-- Content -->
            <div style="padding: 32px 24px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="font-size: 56px; margin-bottom: 12px;">🚚</div>
                <h2 style="color: #0f172a; font-size: 22px; margin: 0 0 8px 0; font-weight: 700;">
                  Buku Anda Sedang Dikirim!
                </h2>
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  Halo <strong>${order.customer_name}</strong>, kabar baik!
                </p>
              </div>

              <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                Buku fisik pesanan Anda telah kami serahkan ke kurir. Silakan
                gunakan nomor resi di bawah ini untuk melacak pengiriman.
              </p>

              <!-- Box Resi -->
              <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                <p style="color: #065f46; font-size: 11px; text-transform: uppercase; font-weight: 700; margin: 0 0 8px 0; letter-spacing: 1px;">
                  Nomor Resi
                </p>
                <p style="color: #0f172a; font-size: 24px; font-weight: 800; font-family: 'Courier New', monospace; margin: 0; letter-spacing: 1px;">
                  ${order.tracking_number}
                </p>
              </div>

              <!-- Alamat Pengiriman -->
              <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; margin: 0 0 8px 0; letter-spacing: 1px;">
                  📦 Dikirim ke
                </p>
                <p style="color: #0f172a; font-size: 14px; line-height: 1.7; margin: 0;">
                  <strong>${order.shipping_name || order.customer_name}</strong><br/>
                  ${order.shipping_phone || ''}<br/>
                  ${order.shipping_address || ''}<br/>
                  ${order.shipping_city || ''}, ${order.shipping_province || ''} ${order.shipping_postal_code || ''}
                </p>
              </div>

              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin: 24px 0;">
                <p style="color: #1e40af; font-size: 13px; line-height: 1.7; margin: 0;">
                  📅 <strong>Estimasi tiba:</strong> 2-5 hari kerja<br/>
                  📱 Anda akan dapat update dari kurir melalui nomor HP yang
                  terdaftar.
                </p>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${baseUrl}/orders/${orderId}"
                   style="display: inline-block; background: #059669; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  🔍 Cek Portal Pesanan
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />

              <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                Ada kendala dengan pengiriman? Hubungi kami di<br />
                <a href="mailto:mustawa.publishing@gmail.com" style="color: #059669; text-decoration: none; font-weight: 600;">
                  mustawa.publishing@gmail.com
                </a>
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #0f172a; padding: 20px; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} Mustawa Publishing
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
      message: 'Email notifikasi resi terkirim ke ' + order.customer_email,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}