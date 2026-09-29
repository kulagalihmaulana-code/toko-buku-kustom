// Fungsi eksekusi saat pembayaran BERHASIL
async function handlePaymentSuccess(orderId: string, payload: any) {
  console.log(`[PAID] Transaksi ${orderId} berhasil dikonfirmasi!`);
  
  const supabase = getSupabaseClient();

  // 1. Ambil ID Buku dari payload item_details Midtrans
  // (Midtrans mengirim balik item_details yang kita daftarkan saat buat token)
  const item = payload.item_details?.[0] || payload.item?.[0];
  const bookId = item?.id;

  if (bookId) {
    // 2. Ambil data buku berdasarkan ID asli Supabase
    const { data: book, error: fetchError } = await supabase
      .from('books')
      .select('id, stock, title')
      .eq('id', bookId)
      .single();

    if (fetchError) {
      console.error('[SUPABASE ERROR]', fetchError.message);
      return;
    }

    if (book) {
      const currentStock = Number(book.stock) || 0;
      
      if (currentStock > 0) {
        const newStock = currentStock - 1;

        // 3. Update stok buku di Supabase
        const { error: updateError } = await supabase
          .from('books')
          .update({ stock: newStock })
          .eq('id', bookId);

        if (updateError) {
          console.error('[UPDATE STOK ERROR]', updateError.message);
        } else {
          console.log(`[SUCCESS] Stok buku "${book.title}" berhasil berkurang dari ${currentStock} menjadi ${newStock}`);
        }
      }
    }
  } else {
    console.log('[WARNING] ID Buku tidak ditemukan dalam payload item_details');
  }
}