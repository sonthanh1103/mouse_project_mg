$(function () {
  const FIELDS = [
    "length",
    "width",
    "height",
    "weight",
    "shape",
    "hump_placement",
    "front_flare",
    "side_curvature",
    "hand_compatibility",
    "thumb_rest",
    "ring_finger_rest",
    "material",
    "connectivity",
    "sensor",
    "sensor_technology",
    "sensor_position",
    "dpi",
    "polling_rate",
    "tracking_speed",
    "acceleration",
    "side_buttons",
    "middle_buttons",
  ];

  const $searchBox = $("#searchBox");
  const $searchSuggestions = $("#searchSuggestions");

  // Sử dụng container mới cho tiêu đề và hiển thị chuột
  const $miceSelectionContainer = $("#miceSelectionContainer");
  const $miceDisplay = $("#miceDisplay");

  const $singleView = $("#singleProductView");
  const $singleProductLegend = $("#singleProductLegend");
  const $singleOutlinesWrap = $("#singleOutlinesWrap");
  const $singleProductTable = $("#singleProductTable");

  const $compareWrap = $("#compareTableWrap");
  const $legendCol = $("#legendCol");
  const $outlinesWrap = $("#outlinesWrap");
  const $compareTable = $("#compareTable");

  let allProducts = [];
  let initialCards = [];
  let compareList = []; // Mảng chứa IDs của các sản phẩm đang so sánh

  // Helper function to create a styled SVG wrapper
  function createStyledSvgWrapper(rawSvgContent, color) {
    let contentHtml = '';

    if (!rawSvgContent || rawSvgContent.trim() === '') {
      contentHtml = '<div class="no-svg-placeholder text-muted small text-center w-100 h-100 d-flex align-items-center justify-content-center"></div>';
    } else {
      const $svgElement = $(rawSvgContent).filter('svg');
      if ($svgElement.length) {
        $svgElement.attr({
          preserveAspectRatio: 'xMidYMid meet',
          width: '100%',
          height: '100%',
          stroke: color,
          'stroke-width': 2, // Đảm bảo độ dày đường viền
          fill: 'none', // Đảm bảo không có màu nền
        }).css('display', 'block');

        $svgElement.css({
            'margin': 'auto',
            'max-width': '100%',
            'max-height': '100%',
            'object-fit': 'contain'
        });
        contentHtml = $('<div>').append($svgElement).html();
      } else if (rawSvgContent.startsWith('http://') || rawSvgContent.startsWith('https://') || rawSvgContent.startsWith('/')) {
        contentHtml = `<img src="${rawSvgContent}" alt="Mouse image" style="width:100%; height:100%; object-fit:contain;">`;
      } else {
        contentHtml = '<div class="no-svg-placeholder text-muted small text-center w-100 h-100 d-flex align-items-center justify-content-center">Invalid SVG</div>';
      }
    }
    // Sử dụng class chung .overlay-svg để áp dụng styling
    return `<div class="overlay-svg">${contentHtml}</div>`;
  }

  // 1) Load toàn bộ (limit cao) và lấy 9 đầu làm initial
  $.getJSON("/api/product/suggested").done((res) => {
    if (!res.success) {
        console.error("Failed to load products:", res.message);
        return;
    }
    allProducts = res.data;
    initialCards = allProducts.slice(0, 27);
    updateCompareView(); // Initial view update
  }).fail((jqXHR, textStatus, errorThrown) => {
      console.error("AJAX Error loading products:", textStatus, errorThrown);
  });

  // 3) Blur → ẩn dropdown
  $searchBox.on("blur", () => {
    setTimeout(() => $searchSuggestions.hide(), 150);
  });

  // 4) Input → debounce + filter allProducts
 $searchBox.on(
"input",
debounce(function () {
    const q = this.value.trim(); // Lấy giá trị nhập vào
    if (q.length > 0) { // Nếu có từ khóa
        $.getJSON("/api/product/search", { q: q }).done((res) => {
            if (res.success) {
                renderDropdown(res.data); // Render kết quả tìm kiếm
                $searchSuggestions.show();
            } else {
                console.error("Search API failed:", res.message);
                $searchSuggestions.empty().append('<div class="list-group-item text-muted">Error searching</div>');
                $searchSuggestions.show();
            }
        }).fail(() => {
            console.error("AJAX error during search.");
            $searchSuggestions.empty().append('<div class="list-group-item text-muted">Network error</div>');
            $searchSuggestions.show();
        });
    } else {
        // Khi ô tìm kiếm trống, hiển thị lại TẤT CẢ sản phẩm đã tải
        renderDropdown(allProducts);
        $searchSuggestions.show();
    }
})
);

$searchBox.on("focus", () => {
    // Khi focus, hiển thị tất cả sản phẩm đã tải
    renderDropdown(allProducts);
    $searchSuggestions.show();
});

  // 5) Render dropdown dưới input - CHỈ HIỂN THỊ BRAND + NAME
function renderDropdown(items) {
    $searchSuggestions.empty();
    if (!items.length) {
      return $searchSuggestions.append(
        '<div class="list-group-item text-muted">No results</div>'
      );
    }
    items.forEach((p) => {
      const brandName = (p.brand && p.brand.name) ? p.brand.name : "";
      const badge = p.isNew ? '<span class="badge-new">NEW</span>' : '';

      $searchSuggestions.append(`
        <div class="list-group-item d-flex align-items-center justify-content-between"
             data-id="${p._id}">
          <div class="d-flex align-items-center">
            <span>${brandName ? `<span>${brandName}</span> ` : ""}${p.name}</span>
          </div>
          ${badge}
        </div>
      `);
    });
  }

  // 6) Click dropdown item → chọn compare
  $searchSuggestions.on("click", ".list-group-item", function () {
    const id = $(this).data("id");
    if (!compareList.includes(id)) {
        compareList.push(id);
    }
    $searchBox.val(""); // Clear search box
    $searchSuggestions.hide(); // Hide suggestions
    updateCompareView();
  });

  // HÀM MỚI: Render mice display (initial suggests hoặc selected mice header)
  // Sử dụng một hàm duy nhất để render cả 2 trường hợp
   function renderMiceDisplay(items, isClickable = true) {
    $miceDisplay.empty();
    items.forEach((p) => {
      let thumbHtml = ''; // Khởi tạo rỗng

      // CHỈ TẠO thumbHtml NẾU isClickable LÀ FALSE (Tức là chỉ hiển thị thumbnail khi đã được chọn)
      if (!isClickable) {
        const thumbContent = p.svg1 ?
          (p.svg1.trim().startsWith("<svg") ? p.svg1 : `<img src="${p.svg1}" style="width:100%; height:100%; object-fit:contain;">`) : '';
        thumbHtml = thumbContent ? `<div class="svg-thumb" style="width:50px; height:50px;">${thumbContent}</div>` : '';
      }

      const brand = p.brand?.name || "";
      $miceDisplay.append(`
        <div class="card p-2 m-2 text-center" data-id="${p._id}" style="width:120px; ${isClickable ? 'cursor:pointer;' : ''}">
          ${thumbHtml} <div class="small text-truncate mt-1">
            ${brand}<br><strong>${p.name}</strong>
          </div>
        </div>
      `);
    });

    // Gắn sự kiện click CHỈ KHI isClickable là true
    $miceDisplay.off("click", ".card"); // Xóa sự kiện cũ để tránh trùng lặp
    if (isClickable) {
        $miceDisplay.on("click", ".card", function () {
            const id = $(this).data("id");
            if (!compareList.includes(id)) {
                compareList.push(id);
            }
            updateCompareView();
        });
    }
  }


  // 9) Cập nhật grid + single/compare view
  function updateCompareView() {
    // Ẩn tất cả các view trước
    $miceSelectionContainer.hide(); // Dòng này ẩn nó ở đây
    $singleView.hide();
    $compareWrap.hide();

    // Xóa nội dung cũ trong legend
    $legendCol.empty();
    $singleProductLegend.empty();

    if (compareList.length === 0) {
        $miceSelectionContainer.show();
        $miceSelectionContainer.find('h4').text('Select Mice to compare'); // Đặt lại tiêu đề
        renderMiceDisplay(initialCards, true); // Hiển thị 9 card ban đầu, cho phép click
    } else if (compareList.length === 1) {
      $singleView.show(); // Hiển thị single view
      loadCompare(compareList).done(products => {
          if (products.length > 0) {
              showSingle(products[0]);
              showSingleProductLegend(products[0]);
          }
      });
    } else {
      $compareWrap.show(); // Hiển thị compare view
      loadCompare(compareList).done((products) => {
          showCompare(products);
          showMultiProductLegend(products);
      });
    }
  }

  // 10) API call so sánh
  function loadCompare(ids) {
    return $.ajax({
      url: "/api/product/compare",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ productIds: ids }),
      dataType: "json",
    }).then((res) => {
        if (!res.success) {
            console.error("API Compare Error:", res.message);
            return [];
        }
        return res.data;
    }).fail((jqXHR, textStatus, errorThrown) => {
        console.error("AJAX Error comparing products:", textStatus, errorThrown);
        return [];
    });
  }

  function showSingle(p) {
    if (!p) return;

    // Lấy màu đã gán hoặc tạo màu mới
    const color = p._color || getRandomColor();

    // Render SVGs
    $singleOutlinesWrap.empty();
    // Đặt mỗi SVG vào một div riêng biệt để flexbox có thể căn chỉnh.
    // CSS .overlay-svg (cho #singleOutlinesWrap) sẽ giúp nó căn giữa và fit.
    $singleOutlinesWrap.append($(createStyledSvgWrapper(p.svg1, color))); // Front profile
    $singleOutlinesWrap.append($(createStyledSvgWrapper(p.svg2 || p.svgOutline, color))); // Side profile

    // Prepare data rows for the table
    const rows = FIELDS.map((f) => {
      let val = p[f];
      if (typeof val === "boolean") val = val ? "Yes" : "No";
      else if (val && typeof val === "object")
        val = val.name ?? JSON.stringify(val);
      else val = val ?? "-";
      return `
        <tr>
          <th>${f.replace(/_/g, " ")}</th>
          <td>${val}</td>
        </tr>
      `;
    }).join("");

    // Render table
    $singleProductTable.html(`<thead class="table-dark"><tr><th>Attribute</th><th>Value</th></tr></thead><tbody>${rows}</tbody>`);
  }

  // HÀM MỚI: Hiển thị legend cho single product
  function showSingleProductLegend(p) {
    $singleProductLegend.empty();
    if (!p._color) p._color = getRandomColor(); // Gán màu nếu chưa có

    const legendHtml = `
      <div class="d-flex align-items-center bg-dark p-2 mb-2 rounded" style="color: ${p._color}; border: 2px solid ${p._color};">
        <div class="flex-grow-1 text-start">
          <span>${p.brand?.name || ""}</span><br>
          <small>${p.name}</small><br>
          <small>${p.length || '-'} * ${p.width || '-'} * ${p.height || '-'} mm ${p.weight || '-'}g</small>
        </div>
        <button type="button" class="btn-close ms-2" data-id="${p._id}"></button>
      </div>
    `;
    $singleProductLegend.append(legendHtml);

    // Xử lý sự kiện click nút đóng trên single product legend
    $singleProductLegend.off("click").on("click", ".btn-close", function () {
        compareList = []; // Xóa toàn bộ danh sách so sánh
        updateCompareView(); // Cập nhật lại view
    });
  }


  // 12) Hiển thị compare table (như ảnh 2)
  function showCompare(products) {
    // Assign a consistent color to each product for outlines and legend
    products.forEach(p => {
      if (!p._color) p._color = getRandomColor(); // Assign color if not already assigned
    });

    // Outlines overlays
    $outlinesWrap.empty(); // Clear previous outlines

    // Create the front and side containers for comparison
    const $frontContainer = $('<div class="front-container"></div>');
    const $sideContainer = $('<div class="side-container"></div>');

    // For each product, create and append its styled SVG wrappers
    products.forEach(p => {
        const color = p._color; // Use the assigned color for this product

        // Append the styled SVG for front profile to the front container
        $frontContainer.append($(createStyledSvgWrapper(p.svg1, color)));

        // Append the styled SVG for side profile to the side container
        $sideContainer.append($(createStyledSvgWrapper(p.svg2 || p.svgOutline, color)));
    });

    // Append both containers to the outlinesWrap
    $outlinesWrap.append($frontContainer, $sideContainer);

    // Table
    let thead = `<thead class="table-dark"><tr><th>Attribute</th>`;
    products.forEach((p) => {
      thead += `<th>${p.brand?.name || ""}<br><small>${p.name}</small></th>`;
    });
    thead += `</tr></thead>`;

    const base = products[0]; // For percentage calculation, compare against the first product
    // Calculate percentage difference. Handle division by zero for base value.
    const pct = (b, v) =>
      typeof b === "number" && typeof v === "number" && b !== 0
        ? `${(((v - b) / b) * 100).toFixed(0)}%`
        : "";

    let tbody = `<tbody>`;
    FIELDS.forEach((f) => {
      tbody += `<tr><th>${f.replace(/_/g, " ")}</th>`;
      products.forEach((p, j) => {
        let val = p[f];
        if (typeof val === "boolean") {
          val = val ? "Yes" : "No";
        } else if (val && typeof val === "object") {
          val = val.name ?? JSON.stringify(val); // Handle objects with a 'name' property
        } else {
          val = val ?? "-"; // Fallback for null/undefined values
        }
        let diff = "";
        // Only calculate diff for subsequent products (j > 0) and if a base product exists
        if (j > 0 && base) {
          const d = pct(base[f], products[j][f]);
          if (d) {
            diff = ` <small class="${d.startsWith("-") ? "text-danger" : "text-success"}">(${d})</small>`;
          }
        }
        tbody += `<td>${val}${diff}</td>`;
      });
      tbody += `</tr>`;
    });
    tbody += `</tbody>`;

    $compareTable.html(thead + tbody);
    $compareTable.addClass('table-dark'); // Apply dark table style
  }

  // HÀM MỚI: Hiển thị legend cho nhiều sản phẩm
  function showMultiProductLegend(products) {
      $legendCol.empty();
      products.forEach((p, i) => {
          $legendCol.append(`
            <div class="d-flex align-items-center bg-dark p-2 mb-2 rounded" style="color: ${p._color}; border: 2px solid ${p._color};">
              <div class="flex-grow-1 text-start">
                <span>${p.brand?.name || ""}</span><br>
                <small>${p.name}</small><br>
                <small>${p.length || '-'} * ${p.width || '-'} * ${p.height || '-'} mm ${p.weight || '-'}g</small>
              </div>
              <button type="button" class="btn-close ms-2" data-index="${i}"></button>
            </div>
          `);
      });
      // Re-bind click event for dynamic buttons on legend column
      $legendCol.off("click").on("click", ".btn-close", function () {
        const indexToRemove = +$(this).data("index");
        compareList.splice(indexToRemove, 1); // Remove item by index
        updateCompareView(); // Re-render view after removal
      });
  }
});