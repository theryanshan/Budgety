var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(e => {
      sum += e.value;
    });
    data.totals[type] = sum;
  };

  return {
    getData: function() {
      return {
        budget: data.budget,
        percentage: data.percentage,
        expenseTotal: data.totals.exp,
        incomeTotal: data.totals.inc
      };
    },

    calculateBudget: function() {
      calculateTotal("exp");
      calculateTotal("inc");
      data.budget = data.totals.inc - data.totals.exp;
      data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
    },

    addItem: function(type, des, val) {
      var newItem, ID;
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1] + 1;
      } else {
        ID = 0;
      }
      switch (type) {
        case "exp":
          newItem = new Expense(ID, des, val);
          break;
        case "inc":
          newItem = new Income(ID, des, val);
          break;
      }
      data.allItems[type].push(newItem);
      return newItem;
    },

    display: function() {
      console.log(data);
    }
  };
})();

var UIController = (function() {
  var DOMStrings = {
    addType: ".add__type",
    addDescription: ".add__description",
    addValue: ".add__value",
    addBtn: ".add__btn",
    expensesList: ".expenses__list",
    incomeList: ".income__list",
    budgetValue: ".budget__value",
    budgetIncomeValue: ".budget__income--value",
    budgetExpenseValue: ".budget__expenses--value",
    budgetExpensePercentage: ".budget__expenses--percentage"
  };

  return {
    getInputs: function() {
      return {
        type: document.querySelector(DOMStrings.addType).value,
        description: document.querySelector(DOMStrings.addDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.addValue).value)
      };
    },

    getDOMStrings: function() {
      return DOMStrings;
    },

    addListItem: function(item, type) {
      var html, newHtml, dom;
      if (type === "inc") {
        html = `<div class="item clearfix" id="income-%id%">
        <div class="item__description">%description%</div>
        <div class="right clearfix">
            <div class="item__value">%value%</div>
            <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
        </div>
        </div>`;
        dom = document.querySelector(DOMStrings.incomeList);
      } else if (type === "exp") {
        html = `<div class="item clearfix" id="expense-%id%">
        <div class="item__description">%description%</div>
        <div class="right clearfix">
            <div class="item__value">%value%</div>
            <div class="item__percentage">21%</div>
            <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
            </div>
        </div>`;
        dom = document.querySelector(DOMStrings.expensesList);
      }
      newHtml = html.replace("%id%", item.id);
      newHtml = newHtml.replace("%description%", item.description);
      newHtml = newHtml.replace("%value%", item.value);
      dom.insertAdjacentHTML("beforeend", newHtml);
    },

    clearFields: function() {
      var list = document.querySelectorAll(
        DOMStrings.addDescription + ", " + DOMStrings.addValue
      );
      var listArray = Array.prototype.slice.call(list);
      listArray.forEach((element, index, array) => {
        element.value = "";
      });
      listArray[0].focus();
    },

    updateBudgetUI: function(budgetData) {
      document.querySelector(DOMStrings.budgetValue).textContent =
        budgetData.budget;
      document.querySelector(DOMStrings.budgetExpensePercentage).textContent =
        budgetData.percentage + "%";
      document.querySelector(DOMStrings.budgetExpenseValue).textContent =
        budgetData.expenseTotal;
      document.querySelector(DOMStrings.budgetIncomeValue).textContent =
        budgetData.incomeTotal;
    }
  };
})();

// Global app controller
var Controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.addBtn).addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
  };

  var updateBudget = function() {
    // 1. cal the budget
    budgetController.calculateBudget();
    // 2. return the budget
    var budgetData = budgetController.getData();
    // 3. display budget on the UI
    UICtrl.updateBudgetUI(budgetData);
  };

  var ctrlAddItem = function() {
    // 1. Get the field input data
    var inputs = UICtrl.getInputs();

    if (inputs.description !== "" && !isNaN(inputs.value) && inputs.value > 0) {
      // 2. Add the item to the budget controller
      var newItem = budgetController.addItem(
        inputs.type,
        inputs.description,
        inputs.value
      );

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, inputs.type);
      UICtrl.clearFields();

      // 4. cal and update budget
      updateBudget();
    }
  };

  return {
    init: function() {
      setupEventListeners();
      updateBudget();
    }
  };
})(budgetController, UIController);

Controller.init();
