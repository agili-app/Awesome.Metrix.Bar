import { createRoot } from "react-dom/client";
import "../src/views/site.css";
import "./gallery.css";
import { Gallery } from "./gallery.tsx";

createRoot(document.getElementById("root")!).render(<Gallery />);
