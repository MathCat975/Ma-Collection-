import { Navigate, Route, Routes } from "react-router-dom";
import { CataloguePage } from "./pages/CataloguePage";
import { ItemDetailPage } from "./pages/ItemDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

export function App(): JSX.Element {
  return <Routes><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route path="/catalogue" element={<CataloguePage />} /><Route path="/catalogue/:id" element={<ItemDetailPage />} /><Route path="*" element={<Navigate to="/catalogue" replace />} /></Routes>;
}
