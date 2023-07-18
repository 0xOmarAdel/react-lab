import { useState } from "react";

const useSort = (initialArray, attribute) => {
  const [sortBy, setSortBy] = useState(attribute);

  const sortedArray = [...initialArray].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) {
      return -1;
    }
    if (a[sortBy] > b[sortBy]) {
      return 1;
    }
    return 0;
  });

  return [setSortBy, sortedArray];
};

export default useSort;