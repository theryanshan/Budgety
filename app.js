var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calculatePercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(e => {
      sum += e.value;
    });
    data.totals[type] = sum;
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

  return {
    // delete an item for type and id
    deleteItem: function(type, id) {
      var ids, idx;
      ids = data.allItems[type].map(function(element) {
        return element.id;
      });

      idx = ids.indexOf(id);
      if (idx !== -1) {
        data.allItems[type].splice(idx, 1);
      }
    },

    getBudget: function() {
      return {
        budget: data.budget,
        percentage: data.percentage,
        totalExp: data.totals.exp,
        totalInc: data.totals.inc
      };
    },

    calculateBudget: function() {
      calculateTotal("exp");
      calculateTotal("inc");
      data.budget = data.totals.inc - data.totals.exp;
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      // a = 10, b = 20, c = 30
      // total income = 100
      // a = 10%, b = 20%, c = 30%
      data.allItems.exp.forEach(ele => {
        ele.calculatePercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      allPerc = data.allItems.exp.map(exp => {
        return exp.getPercentage();
      });
      return allPerc;
    },

    addItem: function(type, des, val) {
      var newItem, ID;
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
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
    budgetLabel: ".budget__value",
    budgetIncomeLabel: ".budget__income--value",
    budgetExpenseLabel: ".budget__expenses--value",
    budgetExpensePercentageLabel: ".budget__expenses--percentage",
    container: ".container",
    itemPercentageLabel: ".item__percentage"
  };

  var formatNumber = function(num, type) {
    var int, dec;
    num = num.toFixed(2);
    num = num.split(".");
    int = num[0];
    dec = num[1];
    int = new Intl.NumberFormat().format(parseInt(int));
    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
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

    displayPercentages: function(allPerc) {
      var fields = document.querySelectorAll(DOMStrings.itemPercentageLabel);
      fields.forEach(function(ele, idx) {
        if (allPerc[idx] > 0) {
          ele.textContent = allPerc[idx] + "%";
        } else {
          ele.textContent = "---";
        }
      });
    },

    addListItem: function(item, type) {
      var html, newHtml, dom;
      if (type === "inc") {
        html = `<div class="item clearfix" id="inc-%id%">
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
        html = `<div class="item clearfix" id="exp-%id%">
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
      newHtml = newHtml.replace("%value%", formatNumber(item.value, type));
      dom.insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function(selectorId) {
      var ele = document.getElementById(selectorId);
      ele.parentNode.removeChild(ele);
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

    displayBudget: function(budgetData) {
      var type;
      budgetData.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(
        budgetData.budget,
        type
      );
      document.querySelector(
        DOMStrings.budgetExpensePercentageLabel
      ).textContent = budgetData.percentage;
      document.querySelector(
        DOMStrings.budgetExpenseLabel
      ).textContent = formatNumber(budgetData.totalExp, "exp");
      document.querySelector(
        DOMStrings.budgetIncomeLabel
      ).textContent = formatNumber(budgetData.totalInc, "inc");

      if (budgetData.percentage > 0) {
        document.querySelector(
          DOMStrings.budgetExpensePercentageLabel
        ).textContent = budgetData.percentage + "%";
      } else {
        document.querySelector(
          DOMStrings.budgetExpensePercentageLabel
        ).textContent = "---";
      }
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
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  var updateBudget = function() {
    // 1. cal the budget
    budgetController.calculateBudget();
    // 2. return the budget
    var budgetData = budgetController.getBudget();
    // 3. display budget on the UI
    UICtrl.displayBudget(budgetData);
  };

  var updatePercentages = function() {
    var allPerc;
    // 1. cal the percentages
    budgetController.calculatePercentages();
    // 2. read percentages from the budget controller
    allPerc = budgetController.getPercentages();
    // 3. update UI
    UICtrl.displayPercentages(allPerc);
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

      // 5. update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, id;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      // inc-1 exp-1
      splitID = itemID.split("-");
      type = splitID[0];
      id = parseInt(splitID[1]);
      // 1. delete item in budget controller
      budgetController.deleteItem(type, id);
      // 2. delete item from UI
      UICtrl.deleteListItem(itemID);
      // 3. update and display new budget
      updateBudget();
      // 4. update percentages
      updatePercentages();
    }
  };

  return {
    init: function() {
      setupEventListeners();
      UIController.displayBudget({
        budget: 0,
        percentage: -1,
        totalExp: 0,
        totalInc: 0
      });
    }
  };
})(budgetController, UIController);

Controller.init();
