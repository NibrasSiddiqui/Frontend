let app1 = new Vue({
    el: '#app1',
    data: {
      test: [],
      cart: [],
      showProduct: true,
      fullName: '',
      number: '',
      formErrors: {},
      isCartEmpty: true,
      cartCount: 0,
      priceSortOrder: 'ascending',
      titleSortOrder: 'ascending',
      spaceSortOrder: 'ascending',
      locSortOrder: 'ascending',
      searchQuery: '',
    },
    methods: {
      addToCart: function (lesson) {
        if (this.canAddToCart(lesson)) {
          const existingLesson = this.cart.find((item) => item.title === lesson.title);
  
          if (existingLesson) {
            existingLesson.quantity++;
          } else {
            this.cart.push({ ...lesson, quantity: 1 });
          }
  
          lesson.availableInventory--;
          this.cartCount++;
  
          this.isCartEmpty = this.cart.length === 0;
        }
      },
      removeFromCart: function (lesson) {
        const existingLessonIndex = this.cart.findIndex((item) => item.title === lesson.title);
  
        if (existingLessonIndex !== -1) {
          const existingLesson = this.cart[existingLessonIndex];
  
          if (existingLesson.quantity > 1) {
            existingLesson.quantity--;
          } else {
            this.cart.splice(existingLessonIndex, 1);
          }
  
          const sharedLesson = this.test.find((item) => item.title === lesson.title);
  
          if (sharedLesson) {
            sharedLesson.availableInventory++;
          }
  
          this.cartCount--;
  
          this.isCartEmpty = this.cart.length === 0;
        }
      },
      canAddToCart: function (lesson) {
        return lesson.availableInventory > 0;
      },
      showCheckout() {
        this.showProduct = !this.showProduct;
      },
      sorttest: function () {
        if (this.priceSortOrder === 'ascending') {
          this.test.sort((a, b) => a.price - b.price);
          this.priceSortOrder = 'descending';
        } else {
          this.test.sort((a, b) => b.price - a.price);
          this.priceSortOrder = 'ascending';
        }
      },
      sorttestByTitle: function () {
        if (this.titleSortOrder === 'ascending') {
          this.test.sort((a, b) => a.title.localeCompare(b.title));
          this.titleSortOrder = 'descending';
        } else {
          this.test.sort((a, b) => b.title.localeCompare(a.title));
          this.titleSortOrder = 'ascending';
        }
      },
      sorttestByLoc: function () {
        if (this.locSortOrder === 'ascending') {
          this.test.sort((a, b) => a.location.localeCompare(b.location));
          this.locSortOrder = 'descending';
        } else {
          this.test.sort((a, b) => b.location.localeCompare(a.location));
          this.locSortOrder = 'ascending';
        }
      },
      sorttestBySpace: function () {
        if (this.spaceSortOrder === 'ascending') {
          this.test.sort((a, b) => a.availableInventory - b.availableInventory);
          this.spaceSortOrder = 'descending';
        } else {
          this.test.sort((a, b) => b.availableInventory - a.availableInventory);
          this.spaceSortOrder = 'ascending';
        }
      },
      validateForm: function () {
        this.formErrors = {};
  
        if (this.order.fullName.trim() === '') {
          this.formErrors.fullName = 'Full Name is required';
        }
        if (!/^\d{11}$/.test(this.order.number)) {
          this.formErrors.number = 'Invalid Number';
        } else if (!/^\d{11}$/.test(this.order.number)) {
          this.formErrors.number = 'Invalid Number';
        }
  
        return Object.keys(this.formErrors).length === 0;
      },
      placeOrder: async function () {
        console.log("It starts here");
        let cartLength = this.cart.map((item) => item.id).length;
        console.log("cartLength " + cartLength);
  
        const orderInfo = {
          "name": this.fullName,
          "lessonIds": this.cart.map((item) => item.id),
          "phoneNumber": this.number,
          "spaces": cartLength
        }
        console.log("orderInfo " + JSON.stringify(orderInfo));
        console.log("name " + this.fullName);
        console.log("phoneNumber " + this.number);
  
        const response = await fetch("http://webcourse.eu-west-2.elasticbeanstalk.com/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(orderInfo)
        });
  
        if (response.ok) {
          console.log("Response is ok");
  
          response = await fetch("http://webcourse.eu-west-2.elasticbeanstalk.com/update", {
            method: "put",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(this.cart.map((item) => item.id))
          });
        }
  
        console.log("IT ends here");
      },
      searchLessons: async function () {
        try {
          const response = await fetch(`http://webcourse.eu-west-2.elasticbeanstalk.com/search?q=${encodeURIComponent(this.searchQuery)}`);
          this.test = await response.json();
        } catch (error) {
          console.error("Error searching lessons:", error);
        }
      },
    },
    computed: {
      isCartEmptyComputed: function () {
        return this.cart.length === 0;
      },
    },
    created: async function () {
      const response = await fetch("http://webcourse.eu-west-2.elasticbeanstalk.com/products");
      this.test = await response.json();
    },
    filters: {
      formatPrice: function (price) {
        if (!parseInt(price)) { return ""; }
        if (price > 99999) {
          var priceString = (price / 100).toFixed(2);
          var priceArray = priceString.split("").reverse();
          var index = 3;
          while (priceArray.length > index + 3) {
            priceArray.splice(index + 3, 0, ",");
            index += 4;
          }
          return "$" + priceArray.reverse().join("");
        } else {
          return "$" + (price / 100).toFixed(2);
        }
      }
    },
  });
  