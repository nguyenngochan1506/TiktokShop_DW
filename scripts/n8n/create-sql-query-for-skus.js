/*
Mục đích: Lấy danh sách sản phẩm đầu vào, lặp qua mảng 'skus'
của từng sản phẩm, và trả về một danh sách item mới,
trong đó mỗi item là một SKU đã được chuẩn bị để INSERT vào database.
*/

const newItems = [];

// Đây là câu lệnh SQL sẽ được dùng cho *mỗi* SKU
// Chúng ta dùng $1, $2... để truyền tham số an toàn
const query = `
    INSERT INTO staging.tbl_base_product_skus (
        product_id, 
        sku_id, 
        sku_sale_props, 
        stock, 
        price_real, 
        price_original
    ) 
    VALUES (
        $1, $2, $3::jsonb, $4, $5, $6
    );
`;

// Lấy thời gian hiện tại để điền vào cột 'valid_from' (cho SCD Type 2)
const now = new Date().toISOString();

// 1. Lặp qua TẤT CẢ các item (sản phẩm) bạn nhận được
for (const item of $input.all()) {
    try {
        // 2. Lấy ra dữ liệu cốt lõi
        const product = item.json.data.product;
        const productId = product.id;
        const skus = product.skus || []; // Dùng || [] để tránh lỗi nếu skus bị null

        // 3. Lặp qua mảng SKUs bên trong sản phẩm
        for (const sku of skus) {
            
            // 4. Chuẩn bị dữ liệu cho các tham số
            // Chuyển đối tượng/mảng thành chuỗi JSON
            const skuSaleProps = JSON.stringify(sku.sku_sale_props || {});

            // Lấy giá trị số, dọn dẹp ký tự
            const priceReal = sku.price && sku.price.real_price ? Number(sku.price.real_price.price_val) : null;
            const priceOriginal = sku.price ? Number(sku.price.original_price_value) : null;
            const stock = sku.stock;

            // 5. Tạo mảng tham số (PHẢI ĐÚNG THỨ TỰ với $1, $2...)
            const parameters = [
                productId,         // $1: product_id
                sku.sku_id,        // $2: sku_id
                skuSaleProps,      // $3: sku_sale_props (đã stringify)
                stock,             // $4: stock
                priceReal,         // $5: price_real
                priceOriginal
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
        console.error("Lỗi xử lý SKU cho một item:", error.message, item.json);
    }
}

// 8. Trả về danh sách các item mới (mỗi item là 1 SKU)
return newItems;