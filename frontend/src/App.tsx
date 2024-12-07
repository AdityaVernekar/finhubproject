import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import Dashboard from "./pages/home/Dashboard";
import { BrowserRouter } from "react-router";
function App() {
  // Create a client
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
