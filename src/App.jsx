import { useMemo } from "react";
import LoginPage from "./component/logIn";
import Users from "./component/users";

const App = () => {
  const token = useMemo(() => {
    const token = localStorage.getItem("token");
    return token;
  }, []);
  return <>{token ? <Users /> : <LoginPage />}</>;
};

export default App;
