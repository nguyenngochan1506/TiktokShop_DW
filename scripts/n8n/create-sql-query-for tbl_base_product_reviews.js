/*
Mục đích: Lặp qua mảng 'review_items' và tạo item SQL
để INSERT hoặc BỎ QUA (ON CONFLICT) cho mỗi review.
*/

const newItems = [];

// Câu lệnh SQL này sẽ được dùng cho *mỗi* review.
// ON CONFLICT (review_id) DO NOTHING: Nếu review_id đã tồn tại, bỏ qua, không báo lỗi.
const query = `
    INSERT INTO staging.tbl_base_product_reviews (
        review_id,
        product_id,
        sku_id,
        sku_specification,
        rating,
        display_text,
        images,
        review_timestamp,
        media,
        load_timestamp
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9::jsonb, NOW())
    ON CONFLICT (review_id) DO NOTHING;
`;

// 1. Lặp qua TẤT CẢ các item (sản phẩm) bạn nhận được
for (const item of $input.all()) {
    try {
        // 2. Lấy ra dữ liệu cốt lõi
        const product = item.json.data.product;
        const productId = product.id;
        const reviewItems = product.reviews.review_items || []; // Dùng || [] để tránh lỗi

        // 3. Lặp qua mảng REVIEWS bên trong sản phẩm
        for (const reviewItem of reviewItems) {
            
            // 4. Chuẩn bị dữ liệu cho các tham số
            const review = reviewItem.review;

            // Chuyển đổi Epoch (dạng chuỗi/số) sang TIMESTAMPTZ
            // Dữ liệu 'review_timestamp' là 13 chữ số (milliseconds)
            const reviewTimestampISO = new Date(Number(review.review_timestamp)).toISOString();

            // Chuyển đối tượng/mảng thành chuỗi JSON
            const imagesJson = JSON.stringify(review.images || []);
            const mediaJson = JSON.stringify(review.media || []);
            
            // 5. Tạo mảng tham số (PHẢI ĐÚNG THỨ TỰ với $1, $2...)
            const parameters = [
                review.review_id,         // $1: review_id
                productId,                // $2: product_id
                reviewItem.sku_id,        // $3: sku_id
                reviewItem.sku_specification, // $4: sku_specification
                review.rating,            // $5: rating
                review.display_text,      // $6: display_text
                imagesJson,               // $7: images (đã stringify)
                reviewTimestampISO,       // $8: review_timestamp (đã chuyển sang ISO)
                mediaJson                 // $9: media (đã stringify)
            ];

            // 6. Tạo item JSON mới chứa query và tham số
            const newItemJson = {
                query: query,
                parameters: parameters
            };

            // 7. Thêm item mới này vào danh sách đầu ra
            newItems.push({
                json: newItemJson
            });
        }
    } catch (error) {
        // Ghi lại lỗi nếu có 1 item bị hỏng, nhưng không làm dừng toàn bộ workflow
        console.error("Lỗi xử lý Reviews cho một item:", error.message, item.json);
    }
}

// 8. Trả về danh sách các item mới (mỗi item là 1 review)
return newItems;