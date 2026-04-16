import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="bg-dark min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-[10rem] md:text-[15rem] text-lime leading-none">
        404
      </h1>
      <p className="font-display text-xl md:text-2xl text-on-dark tracking-widest uppercase mt-4">
        Page Not Found
      </p>
      <p className="text-muted-dark font-body text-sm mt-2 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="font-display text-sm tracking-[0.2em] uppercase bg-lime text-on-lime px-8 py-3 hover:bg-lime/90 transition-all duration-300 glow-lime-hover"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
