import { useEffect, useState } from "react"

const useLocalStorage = (storageKey, fallbackState) => {
  const [value, setValue] = useState(
    JSON.parse(localStorage.getItem(storageKey)) ?? fallbackState
  )

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value))
  }, [value, storageKey])

  return [value, setValue]
}

export default function App() {
  const [tasksArray, setTasksArray] = useLocalStorage("notes", [])
  const [status, setStatus] = useState("all")

  function updateArray() {
    setTasksArray(() => [...tasksArray])
  }

  // useEffect(() => {
  //   localStorage.setItem("notes", JSON.stringify(tasksArray))
  // }, [tasksArray])

  function handleClear() {
    setTasksArray([])
    localStorage.clear()
  }

  function handleChangeTasksArray(text) {
    setTasksArray(() => tasksArray.filter((cur) => cur?.text !== text))
  }

  function handleAddTask(obj) {
    setTasksArray((arr) => [obj, ...arr])
  }

  return (
    <div className="wrapper">
      <Heading />
      <AddTask
        onAddTask={handleAddTask}
        onStatus={setStatus}
        tasks={tasksArray}
        changeTasks={setTasksArray}
      />
      <TaskStatus onClick={handleClear} onSetStatus={setStatus} />
      <TaskList
        tasks={tasksArray}
        changeTasks={handleChangeTasksArray}
        status={status}
        updateArray={updateArray}
      />
    </div>
  )
}

function Heading() {
  return <h2 className="heading">What's the Plan for Today?</h2>
}

function AddTask({ onAddTask, onStatus, tasks }) {
  // const initialArr = localStorage.getItem("notes")
  // if (initialArr) changeTasks(() => JSON.parse(initialArr))
  const [task, setTask] = useState("")

  function handleSubmit(e) {
    e.preventDefault()

    const taskIsRepeated = tasks.filter(
      (cur) => cur.text.toLowerCase().trim() === task.toLowerCase().trim()
    )
    if (!task || !task.replace(/\s/g, "").length || taskIsRepeated.length > 0)
      return

    const newItem = {
      text: task,
      id: Date.now(),
      status: "pending",
      checked: false,
    }

    onAddTask(newItem)
    onStatus("all")
    setTask("")
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <input
        type="text"
        className="add--task"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Add a new task"
      />
      <label className="add--task__plus" onClick={handleSubmit}>
        <ion-icon
          name="add-outline"
          className="add--task__plus-icon"
        ></ion-icon>
      </label>
    </form>
  )
}

function TaskStatus({ onClick, onSetStatus }) {
  return (
    <ul className="task--status__list">
      <button onClick={() => onSetStatus("all")}>All</button>
      <button onClick={() => onSetStatus("pending")}>Pending</button>
      <button onClick={() => onSetStatus("completed")}>Completed</button>
      <button onClick={() => onClick()}>Clear All</button>
    </ul>
  )
}

function TaskList({ tasks, changeTasks, status, updateArray }) {
  const pendingArr = tasks?.filter((task) => task.status === "pending")
  const completedArr = tasks?.filter((task) => task.status === "completed")
  // let message = ""
  // if (completedArr.length === 0) message = `You don't have here any task yet!`

  return (
    <ul className="tasks-list">
      {status === "all" ? (
        tasks.length === 0 ? (
          <p>You don't have any tasks yet!</p>
        ) : (
          tasks?.map((task) => (
            <Task
              task={task}
              changeTasks={changeTasks}
              tasks={tasks}
              key={task.id}
              updateArray={updateArray}
            />
          ))
        )
      ) : (
        ""
      )}
      {status === "pending" ? (
        pendingArr.length === 0 ? (
          <p>You don't have any tasks pending!</p>
        ) : (
          pendingArr.map((task) => (
            <Task
              task={task}
              changeTasks={changeTasks}
              tasks={tasks}
              key={task.id}
              updateArray={updateArray}
            />
          ))
        )
      ) : (
        ""
      )}
      {status === "completed" ? (
        completedArr.length === 0 ? (
          <p>You don't have any tasks completed!</p>
        ) : (
          completedArr.map((task) => (
            <Task
              task={task}
              changeTasks={changeTasks}
              tasks={tasks}
              key={task.id}
              updateArray={updateArray}
            />
          ))
        )
      ) : (
        ""
      )}
    </ul>
  )
}

function Task({ task, changeTasks, tasks, updateArray }) {
  const [checked, setChecked] = useState(task.checked)
  const [changesTabs, setChangesTabs] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)

  task.checked = checked
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(tasks))
  }, [tasks])

  if (checked) task.status = "completed"
  if (!checked) task.status = "pending"

  function handleEditing() {
    setEditing(true)
  }

  function handleKeydown(target) {
    setEditing(false)
    setEditText(target.value)
    task.text = editText
  }

  function handleCheckbox() {
    setChecked(!checked)
    updateArray()
  }
  // function handleInputChange() {
  //   setEditText()
  // }

  return task.text.length > 0 ? (
    <li>
      <div className="task">
        <input
          type="checkbox"
          value={checked}
          checked={checked}
          onChange={() => handleCheckbox()}
        />

        {editing ? (
          <input
            autoFocus
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" ? handleKeydown(e.target) : ""
            }
            className="task--input"
          />
        ) : (
          <p className={checked ? "task--text checked" : "task--text"}>
            {task.text}
          </p>
        )}

        <button
          className="task--dots__button"
          onClick={() => setChangesTabs(!changesTabs)}
          onBlur={() => setChangesTabs(false)}
        >
          <ion-icon
            name="ellipsis-horizontal-outline"
            className="task--dots__icon"
          ></ion-icon>

          {changesTabs ? (
            <div className="task--changes">
              <div className="task--change" onClick={() => handleEditing()}>
                <ion-icon
                  name="create-outline"
                  className="task--changes__icon"
                ></ion-icon>
                Edit
              </div>
              <div
                className="task--change"
                onClick={() => changeTasks(task.text)}
              >
                <ion-icon
                  name="trash-outline"
                  className="task--changes__icon"
                ></ion-icon>
                Delete
              </div>
            </div>
          ) : (
            ""
          )}
        </button>
      </div>
    </li>
  ) : (
    ""
  )
}
