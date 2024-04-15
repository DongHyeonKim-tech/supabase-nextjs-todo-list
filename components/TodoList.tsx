import { Database } from "@/lib/schema";
import { Session, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { getTestList } from "@/pages/api/apiUtils";
import { read, utils } from "xlsx";

type Todos = Database["public"]["Tables"]["todos"]["Row"];

export default function TodoList({ session }: { session: Session }) {
  const supabase = useSupabaseClient<Database>();
  const [todos, setTodos] = useState<Todos[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [searchText, setSearchText] = useState("");

  const user = session.user;

  useEffect(() => {
    const fetchTodos = async () => {
      const { data: todos, error } = await supabase
        .from("todos")
        .select("*")
        .order("id", { ascending: true });

      if (error) console.log("error", error);
      else setTodos(todos);
    };

    fetchTodos();
  }, [supabase]);

  const addTodo = async (taskText: string) => {
    let task = taskText.trim();
    if (task.length) {
      const { data: todo, error } = await supabase
        .from("todos")
        .insert({ task, user_id: user.id })
        .select()
        .single();

      if (error) {
        setErrorText(error.message);
      } else {
        setTodos([...todos, todo]);
        setNewTaskText("");
      }
    }
  };

  const selectTodo = async (searchText: string) => {
    let task = searchText.trim();
    if (task.length) {
      console.log("task: ", task);
      const { data: todo, error } = await supabase
        .from("todos")
        .select()
        .eq("task", searchText);
      console.log("todo: ", todo);
      if (error) {
        setErrorText(error.message);
      } else {
        setSearchText("");
      }
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await supabase.from("todos").delete().eq("id", id).throwOnError();
      setTodos(todos.filter((x) => x.id != id));
    } catch (error) {
      console.log("error", error);
    }
  };

  const getTestListHandler = () => {
    // const testList = getTestList();
    // console.log("testList: ", testList);
    getTestList().then((res) => {
      console.log("testList: ", res);
    });
  };

  // const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     // FileReader를 사용하여 파일 읽기
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       // Excel 파일의 버퍼를 읽어 워크북으로 생성
  //       const arrayBuffer = e.target?.result;
  //       const workbook = read(arrayBuffer, { type: "array" });

  //       // 첫 번째 시트를 선택
  //       const sheetName = workbook.SheetNames[0];
  //       const sheet = workbook.Sheets[sheetName];

  //       // 시트의 데이터를 객체로 변환
  //       const data = utils.sheet_to_json(sheet);

  //       console.log("객체 데이터:", data);
  //       // 데이터를 사용하여 필요한 로직을 구현하세요.
  //     };
  //     reader.readAsArrayBuffer(file);
  //   }
  // };

  const [data, setData] = useState<any[]>([]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      // 파일을 읽기 위해 FileReader 사용
      const reader = new FileReader();
      reader.onload = (e) => {
        // Excel 파일을 읽어 워크북 생성
        const arrayBuffer = e.target?.result;
        const workbook = read(arrayBuffer, { type: "array" });

        // 첫 번째 시트를 선택
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // 시트의 데이터를 객체로 변환
        const sheetData = utils.sheet_to_json(sheet);
        setData(sheetData); // 데이터를 상태에 저장

        console.log("객체 데이터:", sheetData);
        // 데이터에 대한 추가 작업을 수행할 수 있습니다.!
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="w-full">
      <h1 className="mb-12">Todo List.</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTodo(newTaskText);
        }}
        className="flex gap-2 my-2"
      >
        <div>
          <button className={"btn-black"} onClick={() => getTestListHandler()}>
            testList
          </button>
          {/* <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleExcelUpload}
          /> */}
          <div
            style={{
              border: "2px dashed #ccc",
              padding: "20px",
              textAlign: "center",
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <p>Excel 파일을 이 영역에 드래그 앤 드롭하세요</p>
          </div>
        </div>

        <div>
          <input
            className="rounded w-full p-2"
            type="text"
            placeholder="make coffee"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
          />
          <button
            className={"btn-black"}
            onClick={() => {
              selectTodo(searchText);
            }}
          >
            test
          </button>
        </div>
        <div>
          <input
            className="rounded w-full p-2"
            type="text"
            placeholder="make coffee"
            value={newTaskText}
            onChange={(e) => {
              setErrorText("");
              setNewTaskText(e.target.value);
            }}
          />
          <button className="btn-black" type="submit">
            Add
          </button>
        </div>
      </form>
      {!!errorText && <Alert text={errorText} />}
      <div className="bg-white shadow overflow-hidden rounded-md">
        <ul>
          {todos.map((todo) => (
            <Todo
              key={todo.id}
              todo={todo}
              onDelete={() => deleteTodo(todo.id)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

const Todo = ({ todo, onDelete }: { todo: Todos; onDelete: () => void }) => {
  const supabase = useSupabaseClient<Database>();
  const [isCompleted, setIsCompleted] = useState(todo.is_complete);

  const toggle = async () => {
    try {
      const { data } = await supabase
        .from("todos")
        .update({ is_complete: !isCompleted })
        .eq("id", todo.id)
        .throwOnError()
        .select()
        .single();

      if (data) setIsCompleted(data.is_complete);
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <li className="w-full block cursor-pointer hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition duration-150 ease-in-out">
      <div className="flex items-center px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 flex items-center">
          <div className="text-sm leading-5 font-medium truncate">
            {todo.task}
          </div>
        </div>
        <div>
          <input
            className="cursor-pointer"
            onChange={(e) => toggle()}
            type="checkbox"
            checked={isCompleted ? true : false}
          />
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="w-4 h-4 ml-2 border-2 hover:border-black rounded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="gray"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </li>
  );
};

const Alert = ({ text }: { text: string }) => (
  <div className="rounded-md bg-red-100 p-4 my-3">
    <div className="text-sm leading-5 text-red-700">{text}</div>
  </div>
);
