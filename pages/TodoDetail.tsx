import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

const TodoDetail = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>();

  useEffect(() => {
    if (router.query.user) {
      setUser(JSON.parse(router.query.user as string));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => console.log("user: ", user), [user]);

  return <div>TodoDetail</div>;
};

export default TodoDetail;
