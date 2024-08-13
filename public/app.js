// Firebaseの設定
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Firebaseを初期化
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 要素
const loginButton = document.getElementById("googleLogin");
const logoutButton = document.getElementById("logout");
const appDiv = document.getElementById("app");
const tasksList = document.getElementById("tasks");
const newTaskInput = document.getElementById("newTask");
const addTaskButton = document.getElementById("addTask");

// Googleログイン
loginButton.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth
    .signInWithPopup(provider)
    .then((result) => {
      console.log("ログイン成功");
    })
    .catch((error) => {
      console.error("ログインエラー", error);
    });
});

// ログアウト
logoutButton.addEventListener("click", () => {
  auth
    .signOut()
    .then(() => {
      console.log("ログアウト成功");
    })
    .catch((error) => {
      console.error("ログアウトエラー", error);
    });
});

// 認証状態の監視
auth.onAuthStateChanged((user) => {
  if (user) {
    // ユーザーの情報が取得できたら、ログインボタンを非表示にして、ログアウトボタンとタスクを表示する
    loginButton.style.display = "none";
    logoutButton.style.display = "block";
    appDiv.style.display = "block";
    loadTasks();
  } else {
    // ユーザーの情報が取得できなかったら、ログインボタンを表示して、ログアウトボタンとタスクを非表示にする
    loginButton.style.display = "block";
    logoutButton.style.display = "none";
    appDiv.style.display = "none";
  }
});

// Firestoreからタスクをロード
function loadTasks() {
  db.collection("tasks")
    .where("userId", "==", auth.currentUser.uid)
    .onSnapshot((snapshot) => {
      tasksList.innerHTML = "";
      snapshot.forEach((doc) => {
        const task = doc.data();
        const li = document.createElement("li");

        const taskNameSpan = document.createElement("span");
        taskNameSpan.classList.add("task-name");
        taskNameSpan.textContent = task.name;

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("task-buttons");

        const editButton = document.createElement("button");
        editButton.textContent = "編集";
        editButton.addEventListener("click", () => editTask(doc.id, task.name));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "削除";
        deleteButton.addEventListener("click", () => deleteTask(doc.id));

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(deleteButton);

        li.appendChild(taskNameSpan);
        li.appendChild(buttonContainer);

        tasksList.appendChild(li);
      });
    });
}

// タスクを追加
addTaskButton.addEventListener("click", () => {
  const taskName = newTaskInput.value;
  if (taskName.trim()) {
    db.collection("tasks")
      .add({
        name: taskName,
        userId: auth.currentUser.uid,
      })
      .then(() => {
        newTaskInput.value = "";
      })
      .catch((error) => {
        console.error("タスク追加エラー", error);
      });
  }
});

// タスクを編集
function editTask(taskId, currentName) {
  const newName = prompt("タスクを編集", currentName);
  if (newName && newName !== currentName) {
    db.collection("tasks")
      .doc(taskId)
      .update({
        name: newName,
      })
      .catch((error) => {
        console.error("タスク更新エラー", error);
      });
  }
}

// タスクを削除
function deleteTask(taskId) {
  db.collection("tasks")
    .doc(taskId)
    .delete()
    .catch((error) => {
      console.error("タスク削除エラー", error);
    });
}
