import client from "./client";

const assessment = "assessment";

export const getTestList = () => {
  return client.get(`${assessment}/test-list`);
};
