import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className=" flex flex-col gap-2">
      404 Page not found!!
      <Link to="/">Navigate to home</Link>
    </div>
  );
}

export default NotFoundPage;
