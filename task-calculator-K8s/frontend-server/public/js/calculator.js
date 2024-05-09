document.addEventListener('DOMContentLoaded', () => {
    const operationDisplay = document.getElementById('operation-display');
    const resultDisplay = document.getElementById('result-display');
    let currentOperation = '';
    let hasDecimal = false;

    function updateDisplay() {
        operationDisplay.textContent = currentOperation;
        resultDisplay.textContent = '';
    }

    document.querySelectorAll('.key-number, .key-dot').forEach(button => {
        button.addEventListener('click', () => {
            if (button.dataset.number) {
                currentOperation += button.dataset.number;
            } else if (button.dataset.dot && !hasDecimal) {
                currentOperation += '.';
                hasDecimal = true;
            }
            updateDisplay();
        });
    });

    document.querySelectorAll('.key-operation').forEach(button => {
        button.addEventListener('click', () => {
            if (button.dataset.operation === 'equal') {
                console.log("backend api called")
                calculateResult();
            } else {
                currentOperation += ' ' + button.textContent + ' ';
                hasDecimal = false;
            }
            updateDisplay();
        });
    });

    document.querySelectorAll('.key-equal').forEach(button => {
        button.addEventListener('click', () => {
            if (button.dataset.operation === 'equal') {
                console.log("backend api called")
                calculateResult();
            } else {
                currentOperation += ' ' + button.textContent + ' ';
                hasDecimal = false;
            }
            updateDisplay();
        });
    });

    document.querySelector('.key-function[data-operation="clear"]').addEventListener('click', () => {
        currentOperation = '';
        hasDecimal = false;
        updateDisplay();
        resultDisplay.textContent = '0';
    });

    document.querySelector('.key-function[data-operation="delete"]').addEventListener('click', () => {
        if (currentOperation.endsWith('.')) {
            hasDecimal = false;
        }
        currentOperation = currentOperation.slice(0, -1);
        updateDisplay();
    });

    const priorityMap = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
        '^': 3,
        '√': 3,
        '%': 3
    };
    async function evaluateComplexExpression(expression) {
        let parts = expression.split(' ');
        if (parts.length === 1) {
            return parts[0];
        }
        let highestPriority = 0;
        let operationIndex = -1;
        for (let i = 1; i < parts.length; i += 2) {
            let priority = priorityMap[parts[i]];
            if (priority > highestPriority) {
                highestPriority = priority;
                operationIndex = i;
            }
        }
        let num1 = parts[operationIndex - 1];
        let operator = parts[operationIndex];
        let num2 = parts[operationIndex + 1];
        let result = await calculateSingleStep(num1, operator, num2);
        parts.splice(operationIndex - 1, 3, result);
        let newExpression = parts.join(' ');
        return await evaluateComplexExpression(newExpression);
    }

    async function calculateResult() {
        let result = await evaluateComplexExpression(currentOperation);
        resultDisplay.textContent = result;
        currentOperation = '';
        hasDecimal = false;
    }
    async function calculateSingleStep(num1, operator, num2) {
        const operationMap = {
            '+': 'add',
            '-': 'subtract',
            '*': 'multiply',
            '/': 'divide',
            '^': 'exponent',
            '√': 'sqrt',
            '%': 'modulo'
        };
        const operation = operationMap[operator];
        var token = sessionStorage.getItem('token');

        const response = await fetch(`/api/calculate/${operation}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({ num1, num2 }),
        });
        const data = await response.json();
        return data.result;
    }
});
