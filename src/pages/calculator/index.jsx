import React, { useState } from "react";

//State 与 Props 传递合理
//input 仅在 Calculator 组件管理，并通过 Props 传递给 Display 组件。
//handleButtonClick 作为 Props 传递给 ButtonGrid，确保 Calculator 统一处理状态。

//1. 计算器按钮组件
const CalculatorButton = ({ onClick, className, children }) => (
  <button onClick={onClick} className={`p-4 rounded ${className}`}>
    {children}
  </button>
);

//2. 样式定义
const BUTTON_STYLES = {
  number: "bg-gray-200 hover:bg-gray-300",
  operator: "bg-blue-500 text-white hover:bg-blue-600",
  function: "bg-gray-300 hover:bg-gray-400",
  clear: "bg-red-500 text-white hover:bg-red-600",
  equals: "bg-green-500 text-white hover:bg-green-600",
};

//3. 显示组件（Display）
const Display = ({ input }) => (
  <div className="bg-gray-100 p-4 rounded mb-4 h-24">
    <div className="text-right text-xl text-gray-600 min-h-[1.5rem]">
      {input}
    </div>
  </div>
);

//4. 按钮网格组件（ButtonGrid）
const ButtonGrid = ({ handleButtonClick }) => {
  const BUTTONS = [
    [{ label: "C", style: BUTTON_STYLES.clear },
      { label: "+/-", style: BUTTON_STYLES.function },
      { label: "%", style: BUTTON_STYLES.function },
      { label: "÷", style: BUTTON_STYLES.operator }],
    [{ label: "7", style: BUTTON_STYLES.number },
      { label: "8", style: BUTTON_STYLES.number },
      { label: "9", style: BUTTON_STYLES.number },
      { label: "×", style: BUTTON_STYLES.operator }],
    [{ label: "4", style: BUTTON_STYLES.number },
      { label: "5", style: BUTTON_STYLES.number },
      { label: "6", style: BUTTON_STYLES.number },
      { label: "-", style: BUTTON_STYLES.operator }],
    [{ label: "1", style: BUTTON_STYLES.number },
      { label: "2", style: BUTTON_STYLES.number },
      { label: "3", style: BUTTON_STYLES.number },
      { label: "+", style: BUTTON_STYLES.operator }],
    [{ label: "0", style: BUTTON_STYLES.number },
      { label: ".", style: BUTTON_STYLES.number },
      { label: "←", style: BUTTON_STYLES.function },
      { label: "=", style: BUTTON_STYLES.equals },
      { label: "(", style: BUTTON_STYLES.operator },
      { label: ")", style: BUTTON_STYLES.operator }]
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {BUTTONS.flat().map((btn, i) => (
        <CalculatorButton key={i} onClick={() => handleButtonClick(btn.label)} className={btn.style}>
          {btn.label}
        </CalculatorButton>
      ))}
    </div>
  );
};

//5. 计算逻辑
const calc = (a, b, operator) => {
  switch (operator) {
    case "+": return a + b;
    case "-": return a - b;
    case "×": return a * b;
    case "÷": return b !== 0 ? a / b : "Error";
    default: throw new Error("Invalid operator");
  }
};

const precedence = {
  "+": 1, "-": 1, "×": 2, "÷": 2, "(": 0
};

const parseAndEvaluate = (input) => {
  const tokens = input.split(/([+\-×÷()])/).filter(t => t.trim() !== "");
  const outputQueue = [];
  const operatorStack = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // 处理负数
    if (token === "-" && (i === 0 || /[+\-×÷(]/.test(tokens[i - 1]))) {
      const nextToken = tokens[i + 1];
      if (!isNaN(parseFloat(nextToken))) {
        outputQueue.push(-parseFloat(nextToken));
        i++;
        continue;
      }
    }

    if (!isNaN(parseFloat(token))) {
      outputQueue.push(parseFloat(token));
    } else if (token === "(") {
      operatorStack.push(token);
    } else if (token === ")") {
      while (operatorStack.length && operatorStack[operatorStack.length - 1] !== "(") {
        const operator = operatorStack.pop();
        const b = outputQueue.pop();
        const a = outputQueue.pop();
        outputQueue.push(calc(a, b, operator));
      }
      operatorStack.pop();
    } else {
      while (
        operatorStack.length &&
        precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
        ) {
        const operator = operatorStack.pop();
        const b = outputQueue.pop();
        const a = outputQueue.pop();
        outputQueue.push(calc(a, b, operator));
      }
      operatorStack.push(token);
    }
  }

  while (operatorStack.length) {
    const operator = operatorStack.pop();
    const b = outputQueue.pop();
    const a = outputQueue.pop();
    outputQueue.push(calc(a, b, operator));
  }

  return outputQueue.pop();
};

//6. 计算器主组件
function Calculator() {
  const [input, setInput] = useState("");

  const handleButtonClick = (value) => {
    if (value === "C") return setInput("");
    if (value === "←") return setInput(input.slice(0, -1));
    if (value === "=") {
      try {
        const result = parseAndEvaluate(input);
        setInput(result !== undefined ? result : "Error");
      } catch {
        setInput("Error");
      }
      return;
    }
    if (value === "+/-" || value === "%") {
      if (/^-?\d+(\.\d+)?$/.test(input)) {
        setInput(value === "+/-" ? (parseFloat(input) * -1).toString() : (parseFloat(input) / 100).toString());
      }
      return;
    }
    if (/[+\-×÷]/.test(value) && /[+\-×÷]$/.test(input)) {
      setInput(input.slice(0, -1) + value);
    } else {
      setInput(input + value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-emerald-800 mb-4">计算器</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <Display input={input} />
        <ButtonGrid handleButtonClick={handleButtonClick} />
      </div>
    </div>
  );
}

export default Calculator;
