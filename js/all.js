const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCart-tableList");

let productData = [];
let cartData = [];
function init() {
  getProductList();
  getCartList();
}
init();

function getProductList() {
  axios
    .get(
      "https://livejs-api.hexschool.io/api/livejs/v1/customer/jsweek08/products"
    )
    .then(function (res) {
      console.log(res.data.products);
      productData = res.data.products;
      renderProductList();
    });
}

function combineProductHTMLItem(item) {
  return `
        <li class="productCard">
        <h4 class="productType">新品</h4>
        <img
          src="${item.images}"
          alt="">
        <a href="#" class="js-addCart"  id="addCardBtn" data-id="${item.id}">加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${item.origin_price}</del>
        <p class="nowPrice">NT$${item.price}</p>
      </li>`;
}

function renderProductList() {
  let str = "";
  productData.forEach(function (item) {
    str += combineProductHTMLItem(item);

    productList.innerHTML = str;
  });
}

productSelect.addEventListener("change", function (e) {
  //取得select的category
  const category = e.target.value;
  if (category == "全部") {
    renderProductList();
    return;
  }
  // 把str清空
  let str = "";
  productData.forEach(function (item) {
    if (item.category == category) {
      str += combineProductHTMLItem(item);
    }
  });
  productList.innerHTML = str;
});

productList.addEventListener("click", function (e) {
  e.preventDefault();
  let addCartClass = e.target.getAttribute("class");
  if (addCartClass !== "js-addCart") {
    return;
  }
  //點擊商品列表時，取得產品的id，之後要post出去
  let productId = e.target.getAttribute("data-id");
  //點擊商品列表時，取得產品的數量，之後要post出去
  let numCheck = 1;

  cartData.forEach(function (item) {
    if (item.product.id === productId) {
      numCheck = item.quantity += 1;
    }
  });

  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
      {
        data: {
          productId: productId,
          quantity: numCheck,
        },
      }
    )
    .then(function (res) {
      alert("加入購物車");
      getCartList();
    });
});

//在製作購物車清單的叉叉按鈕時先插入data-id:item-id，之後點擊可以監聽並發送delete，delete完重新渲染
function getCartList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (res) {
      console.log(res);
      //把tfoot的總金額寫進去
      document.querySelector(".js-total").textContent = res.data.finalTotal;
      //透過get取得購物車資料並丟到cartData陣列裡面
      cartData = res.data.carts;
      let str = "";
      //把購物車資料陣列跑foreach把html渲染出來
      cartData.forEach(function (item) {
        str += `<tr>
            <td>
              <div class="cardItem-title">
                <img src="${item.product.images}" alt="">
                <p>${item.product.title}</p>
              </div>
            </td>
            <td>NT${item.product.price}</td>
            <td>${item.quantity}</td>
            <td>NT${item.product.price * item.quantity}</td>            
            <td class="discardBtn">
              <a href="#" class="material-icons" data-id="${item.id}">
                clear
              </a>
            </td>
          </tr>`;
      });
      cartList.innerHTML = str;
    });
}

cartList.addEventListener("click", function (e) {
  e.preventDefault();
  const cartId = e.target.getAttribute("data-id");
  if (cartId == null) {
    alert("你點到其他東西囉");
    return;
  }
  console.log(cartId);
  axios
    .delete(
      `https://ec-course-api.hexschool.io/v2/api/${api_path}/cart/${cartId}`
    )
    .then(function (res) {
      console.log(res);
      alert("刪除單筆購物車成功");
      getCartList();
    });
});
