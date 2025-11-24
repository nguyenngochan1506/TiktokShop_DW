// N8N Code Node

const finalResults = [];

for (const item of items) {
  try {
    // Dữ liệu đầu vào là một chuỗi JSON, cần phải parse nó trước
    const dataString = item.json.data.replaceAll('\n', ' ');
    const dataJson = JSON.parse(dataString);

    // Đi đến đúng key chứa dữ liệu trang sản phẩm
    const pageData = dataJson.loaderData['shop/(region)/pdp/(product_name_slug$)/(product_id)/page'];

    // Tìm component chứa thông tin sản phẩm chính
    const productInfoComponent = pageData.page_config.components_map.find(c => c.component_type == 'product_info');

    if (productInfoComponent && productInfoComponent.component_data) {
      const data = productInfoComponent.component_data;

      // Áp dụng logic của bạn để tạo đối tượng sản phẩm mới
      const product = {
        id: data.product_info.product_id,
        title: data.product_info.product_base.title,
        description: data.product_info.product_base.desc_detail,
        images: data.product_info.product_base.images,
        default_sku_id: data.product_info.default_sku_id,
        price: {
          original: data.product_info.product_base.price.original_price,
          sale: data.product_info.product_base.price.real_price,
          currency: data.product_info.product_base.price.currency
        },
        sold: data.product_info.product_base.sold_count,
        shop_info: data.shop_info,
        specifications: data.product_info.product_base.specifications,
        reviews: data.product_info.product_detail_review,
        skus: data.product_info.skus,
        categories: data.categories,
        sale_props: data.product_info.sale_props
      };

      // Đẩy kết quả đã xử lý vào mảng trả về
      finalResults.push({
        json: {
          product: product
        }
      });
    } else {
       // Xử lý trường hợp không tìm thấy component
       finalResults.push({
        json: {
          error: "Không tìm thấy component product_info.",
          original_item: item.json
        }
      });
    }

  } catch (error) {
    // Bắt lỗi nếu có vấn đề khi parse JSON hoặc xử lý dữ liệu
    console.error("Lỗi xử lý item:", error);
    finalResults.push({
      json: {
        error: error.message,
        original_item: item.json
      }
    });
  }
}

// Trả về dữ liệu đã được xử lý
return finalResults[0];