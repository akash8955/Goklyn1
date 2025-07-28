import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollTop = ({ children }) => {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [location.pathname]);

    return children;
};

export default ScrollTop;
