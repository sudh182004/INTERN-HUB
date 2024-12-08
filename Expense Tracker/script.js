const firebaseConfig = {
  apiKey: "AIzaSyDpPFlzh_lD4HsihzXOa0qyPvqQBNiN-mI",
  authDomain: "test-id-40164.firebaseapp.com",
  databaseURL: "https://test-id-40164-default-rtdb.firebaseio.com",
  projectId: "test-id-40164",
  storageBucket: "test-id-40164.firebasestorage.app",
  messagingSenderId: "644298757769",
  appId: "1:644298757769:web:27e548f74254f50a2f5858"
};

const logout = document.getElementById('logout')
logout.addEventListener('click',()=>{
  auth.signOut().then(() => {
    // Successfully logged out
    alert("User signed out successfully");
  
    // Optionally, redirect the user to a login page
    window.location.href = "index.html"; 
  }).catch((error) => {
    // Handle any errors that occur during sign-out
    alert("Error signing out: ", error);
  });
})

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const db = firebase.firestore();
let sum_income = 0;
let sum_expense = 0;

const d = new Date();
const formattedDate = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
}).format(d);

const loader = document.querySelector('.loader');
const values = document.querySelector('.container');

// Single onAuthStateChanged listener
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log(user);

    // Hide loader once the user is authenticated
    if (loader) {
      loader.style.display = 'none';
    }

    // Check if it's the user's first login and prompt to enter their monthly salary
    const userRef = db.collection('users').doc(user.email);
    userRef.get().then(doc => {
      if (!doc.exists) {
        // Prompt for monthly salary on first login
        const salary = prompt("Please enter your monthly salary:");

        if (salary) {
          // Store the salary in Firestore for the user
          userRef.set({
            salary: Number(salary),
          }).then(() => {
            alert("Salary saved!");
          }).catch((error) => {
            alert("Error saving salary: ", error);
          });
        }
      }
    });

    // Send transaction data
    const modalElement = document.getElementById('exampleModal');
    const myModal = new bootstrap.Modal(modalElement);
    document.querySelector('#btn_send').addEventListener('click', () => {
      
      const select_type = document.querySelector('.select_type');
      const input_amount = document.querySelector('.input_amount').value;
      const description = document.querySelector('#description').value;  // Get the description
      const docId = firebase.firestore().collection('transactions').doc().id;
    
      if (input_amount != "" && select_type.value != "Choose" && description != "") {
        if (select_type.value === "Expense") {
          // Check if balance is sufficient before adding expense
          console.log(input_amount)
          console.log(sum_expense)
          console.log(sum_income)
          if (sum_income - sum_expense - input_amount < 0) {
            alert("You can't add more expense without updating your salary or reducing your existing expense.");
            return;
          }
        }
        myModal.hide();
    
        // Add the description along with other transaction details
        db.collection(user.email).doc(docId).set({
          date: formattedDate,
          type: select_type.value,
          amount: input_amount,
          description: description,  // Save the description
        })
        .then(() => {
          alert("Your data has been added");
          location.reload()
        })
        .catch((error) => {
          alert("Error writing document: ", error);
        });
      } else {
        alert('Fill the fields properly');
      }
    });
    
    // Extract current month

    const graphContainer = document.getElementById('graph-container'); // Add a container for the graph

    // Firestore Real-time Listener for Transactions
    db.collection(user.email).onSnapshot((snapshot) => {
      if (snapshot.empty) {
        document.querySelector('.container').innerHTML = "No Data Found";
        return;
      }
    
      let dailyIncome = Array(31).fill(0); // Initialize an array to store daily income for the current month
      let dailyExpense = Array(31).fill(0); // Initialize an array to store daily expenses for the current month
    
      // let sum_income = 0;
      // let sum_expense = 0;
    
      // Container for values
      const values = document.querySelector('.container');
      values.innerHTML = ''; // Clear previous transactions
    
      snapshot.docChanges().forEach((change) => {
        const doc = change.doc;
        const data = doc.data();
        const description = data.description;  
        let icon = "default-icon";  // Defau
        
        if (description.toLowerCase().includes("food")) {
          icon = "fa-utensils";  // Example icon for food-related expenses
        } else if (description.toLowerCase().includes("salary")) {
          icon = "fa-money-bill";  // Example icon for salary-related income
        } else if (description.toLowerCase().includes("entertainment")) {
          icon = "fa-film";  // Example icon for entertainment expenses
        }else if (description.toLowerCase().includes(("cab")||("oil"))) {
          icon = "fa-cab";  // Example icon for entertainment expenses
        }else{
          icon = "fa-circle";  // Example icon for entertainment expenses
        }

        // Ensure `data.date` is properly handled
        const transactionDate = new Date(data.date);
        const day = transactionDate.getDate(); // Get the day of the transaction
    
        if (transactionDate.toLocaleString('default', { month: 'long' }) === currentMonth &&
          transactionDate.getFullYear() === currentYear) {
    
          // Update daily sums
          if (data.type === 'Income') {
            dailyIncome[day - 1] += Number(data.amount);
          } else if (data.type === 'Expense') {
            dailyExpense[day - 1] += Number(data.amount);
          }
        }
    
        // Update total sums for display
        if (data.type === 'Income') {
          sum_income += Number(data.amount);
        } else if (data.type === 'Expense') {
          sum_expense += Number(data.amount);
        }
    
        // Update input fields for totals
        document.getElementById('holderName').value = Math.floor(sum_income);
        document.getElementById('expiry').value = Math.floor(sum_expense);
        document.getElementById('cardNumber').value = Math.floor(sum_income - sum_expense);
    
        // Create Transaction Card
        const transactionCard = document.createElement('div');
        transactionCard.classList.add('transaction-card', 'mt-4');
        transactionCard.setAttribute('data-id', doc.id);
    
        const iconBackgroundColor = data.type === 'Expense' ? 'red' : 'green';
        transactionCard.innerHTML = `
           <div class="icon-background" style="background-color: white; width: 30px; height: 30px; border-radius: 50%; object-fit: cover; margin-right: 15px;">
      <i class="fas ${icon}"></i>  <!-- Dynamic icon based on description -->
    </div>
    <div>
      <div class="fw-bold">${data.type}</div>
      <div class="text-muted">${data.date}</div>
    </div>
    <div class="amount ${data.amount < 0 ? 'negative' : 'positive'}" style="color: ${iconBackgroundColor};">$${data.amount}</div>
    <button class="delete-btn">
      <i class="fa-solid fa-trash" id="delete_i" style="margin-left:12px;"></i>
    </button>
        `;
    
        // Append card to container
        values.appendChild(transactionCard);
    
        // Add delete functionality
        const deleteButton = transactionCard.querySelector('#delete_i');
        deleteButton.addEventListener('click', () => {
          if (confirm("Are you sure you want to delete?")) {
            db.collection(user.email).doc(doc.id).delete()
              .then(() => {
                alert("Document successfully deleted!");
                location.reload();
              })
              .catch((error) => {
                console.error("Error removing document: ", error);
                alert("Error removing document.");
              });
            transactionCard.remove();
          }
        });
      });
    
      // Call the graph function with updated daily income and expense
      createGraph(dailyIncome, dailyExpense);
    });
    
    // Create Line Graph
    function createGraph(dailyIncome, dailyExpense) {
      const ctx = document.getElementById('myChart').getContext('2d');
      
      // Generate the days for X-axis (1 to 31)
      const days = Array.from({ length: 31 }, (_, i) => i + 1);
    
      const chartData = {
        labels: days, // Days of the month
        datasets: [
          {
            label: `Income for ${currentMonth} ${currentYear}`,
            data: dailyIncome, // Data for income
            backgroundColor: 'rgba(0,0,0)', // Light green
            borderColor: 'trasnparet',
            borderWidth: 2,
            fill: true, // Fill area under the line
          },
          {
            label: `Expense for ${currentMonth} ${currentYear}`,
            data: dailyExpense, // Data for expenses
            backgroundColor: 'rgba(255,64,129)', // Light red
            borderColor: 'red',
            borderWidth: 2,
            fill: true, // Fill area under the line
          }
        ],
      };
    
      if (window.myChart && window.myChart.data && window.myChart.data.datasets) {
        // Update the existing chart
        window.myChart.data.labels = chartData.labels;
        window.myChart.data.datasets[0].data = chartData.datasets[0].data;
        window.myChart.data.datasets[1].data = chartData.datasets[1].data;
        window.myChart.update();
      } else {
        // Create a new chart if it doesn't exist or is not properly initialized
        window.myChart = new Chart(ctx, {
          type: 'bar', // Change the chart type to 'line'
          data: chartData,
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    }
    
    // Initialize Variables
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    // Debugging logs for consistency
    console.log("Current Month:", currentMonth);
    console.log("Current Year:", currentYear);
    
  }
});
document.getElementById('showGraphBtn').addEventListener('click', () => {
  const graphModal = new bootstrap.Modal(document.getElementById('graphModal'));
  graphModal.show(); // Show the modal with the chart
});