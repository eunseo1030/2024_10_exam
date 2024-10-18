'use client';

import * as React from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  TextField,
  CssBaseline,
  Chip,
  SwipeableDrawer,
  List,
  ListItem,
  Divider,
  ListItemButton,
  Modal,
  Snackbar,
  Alert,
  Checkbox,
} from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { RecoilRoot, atom, useRecoilState } from 'recoil';
import { FaBars, FaCheck, FaEllipsisV } from 'react-icons/fa';
import dateToStr from './dateUtil';
import RootTheme from './theme';

const todosAtom = atom({
  key: 'app/todosAtom',
  default: [],
});

const lastTodoIdAtom = atom({
  key: 'app/lastTodoIdAtom',
  default: 0,
});

function useTodosStatus() {
  const [todos, setTodos] = useRecoilState(todosAtom);
  const [lastTodoId, setLastTodoId] = useRecoilState(lastTodoIdAtom);
  const lastTodoIdRef = React.useRef(lastTodoId);

  lastTodoIdRef.current = lastTodoId;

  const addTodo = (newContent) => {
    const id = ++lastTodoIdRef.current;
    setLastTodoId(id);
    const newTodo = {
      id,
      content: newContent,
      regDate: dateToStr(new Date()),
      completed: false, // 새로운 할 일은 미완료 상태로 추가
    };
    setTodos((todos) => [newTodo, ...todos]);
    return id;
  };

  const toggleComplete = (id) => {
    const newTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(newTodos);
  };

  const removeTodo = (id) => {
    const newTodos = todos.filter((todo) => todo.id !== id);
    setTodos(newTodos);
  };

  return {
    todos,
    addTodo,
    toggleComplete,
    removeTodo,
  };
}

const NewTodoForm = ({ noticeSnackbarStatus }) => {
  const todosStatus = useTodosStatus();
  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    form.content.value = form.content.value.trim();
    if (form.content.value.length === 0) {
      alert('할 일을 입력하세요.');
      form.content.focus();
      return;
    }
    const newTodoId = todosStatus.addTodo(form.content.value);
    form.content.value = '';
    form.content.focus();
    noticeSnackbarStatus.open(`${newTodoId}번 할 일 추가됨`);
  };

  return (
    <>
      <form className="tw-flex tw-flex-col tw-p-4 tw-gap-2" onSubmit={(e) => onSubmit(e)}>
        <TextField
          multiline
          maxRows={4}
          name="content"
          id="outlined-basic"
          label="할 일 입력"
          variant="outlined"
          autoComplete="off"
        />
        <Button className="tw-text-bold" variant="contained" type="submit">
          추가
        </Button>
      </form>
    </>
  );
};

const TodoListItem = ({ todo, index, toggleComplete }) => {
  return (
    <>
      <li className="tw-mb-3" key={todo.id}>
        <div className="tw-flex tw-flex-col tw-gap-2 tw-mt-3">
          <div className="tw-flex tw-gap-x-2 tw-font-bold">
            <Chip className="tw-pt-[3px]" label={`번호 : ${todo.id}`} variant="outlined" />
            <Chip
              className="tw-pt-[3px]"
              label={`날짜 : ${todo.regDate}`}
              variant="outlined"
              color="primary"
            />
          </div>
          <div className="tw-rounded-[10px] tw-shadow tw-flex tw-text-[14px] tw-min-h-[80px]">
            <Checkbox
              checked={todo.completed}
              onChange={() => toggleComplete(todo.id)}
              color="primary"
            />
            <div className="tw-bg-blue-300 tw-flex tw-items-center tw-p-3 tw-flex-grow tw-whitespace-pre-wrap tw-leading-relaxed tw-break-words">
              할 일 : {todo.content}
            </div>
          </div>
        </div>
      </li>
    </>
  );
};

const TodoList = ({ noticeSnackbarStatus }) => {
  const todosStatus = useTodosStatus();

  return (
    <>
      <nav>
        할 일 갯수 : {todosStatus.todos.length}
        <ul>
          {todosStatus.todos.map((todo, index) => (
            <TodoListItem
              key={todo.id}
              todo={todo}
              index={index}
              toggleComplete={todosStatus.toggleComplete}
            />
          ))}
        </ul>
      </nav>
    </>
  );
};

function NoticeSnackbar({ status }) {
  return (
    <>
      <Snackbar open={status.opened} autoHideDuration={status.autoHideDuration} onClose={status.close}>
        <Alert variant={status.variant} severity={status.severity}>
          {status.msg}
        </Alert>
      </Snackbar>
    </>
  );
}

function useNoticeSnackbarStatus() {
  const [opened, setOpened] = React.useState(false);
  const [autoHideDuration, setAutoHideDuration] = React.useState(null);
  const [variant, setVariant] = React.useState(null);
  const [severity, setSeverity] = React.useState(null);
  const [msg, setMsg] = React.useState(null);

  const open = (msg, severity = 'success', autoHideDuration = 3000, variant = 'filled') => {
    setOpened(true);
    setMsg(msg);
    setSeverity(severity);
    setAutoHideDuration(autoHideDuration);
    setVariant(variant);
  };

  const close = () => {
    setOpened(false);
  };

  return {
    opened,
    open,
    close,
    autoHideDuration,
    variant,
    severity,
    msg,
  };
}

function App() {
  const todosStatus = useTodosStatus();
  const noticeSnackbarStatus = useNoticeSnackbarStatus();

  React.useEffect(() => {
    todosStatus.addTodo('스쿼트');
    todosStatus.addTodo('벤치프레스');
    todosStatus.addTodo('데드리프트');
  }, []);

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <div className="logo-box">
            <a href="/" className="tw-font-bold">
              할 일 관리
            </a>
          </div>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <NoticeSnackbar status={noticeSnackbarStatus} />
      <NewTodoForm noticeSnackbarStatus={noticeSnackbarStatus} />
      <TodoList noticeSnackbarStatus={noticeSnackbarStatus} />
    </>
  );
}

export default function themeApp() {
  const theme = RootTheme();

  return (
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </RecoilRoot>
  );
}
