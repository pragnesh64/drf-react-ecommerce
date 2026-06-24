import React, { useState, useEffect, useRef } from "react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function SearchBox({ keyword, setKeyword }) {
  const [keywordText, setKeywordText] = useState(keyword);
  const navigate = useNavigate();
  const debounceTimer = useRef(null);
  const isMounted = useRef(false);

  const queryParams = new URLSearchParams(window.location.search);
  const brandParam = queryParams.get("brand") ? Number(queryParams.get("brand")) : 0;
  const categoryParam = queryParams.get("category") ? Number(queryParams.get("category")) : 0;

  useEffect(() => {
    // Skip on first mount — only run when user actually types
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (keywordText.trim() === "") {
        // Cleared — go back to home
        setKeyword("");
        navigate("/");
      } else {
        navigate(`/search?keyword=${keywordText}&brand=${brandParam}&category=${categoryParam}`);
        setKeyword(keywordText);
      }
    }, 400);

    return () => clearTimeout(debounceTimer.current);
  }, [keywordText]);

  return (
    <Form style={{ display: "flex" }} className="p-1" onSubmit={(e) => e.preventDefault()}>
      <Form.Control
        type="text"
        placeholder="Search products..."
        value={keywordText}
        onChange={(e) => setKeywordText(e.currentTarget.value)}
        className="mx-2"
        style={{ minWidth: "220px" }}
      />
    </Form>
  );
}

export default SearchBox;
