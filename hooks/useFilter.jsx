import { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useFilter = (array, filterFunction, urlSearchParamName, useSearchParamValue) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [active, setActive] = useState(searchParams.get(urlSearchParamName) ? true : false);
  const [filteredArray, setFilteredArray] = useState(searchParams.get(urlSearchParamName) ? filterFunction(array) : array);

  const toggleFilter = useCallback(
    () => {
      const searchParams = new URLSearchParams(location.search);
      if (active) {
        setFilteredArray(array);
        searchParams.delete(urlSearchParamName);
      } else {
        setFilteredArray(filterFunction(array));
        searchParams.set(urlSearchParamName, useSearchParamValue);
      }

      navigate(`${location.pathname}?${searchParams.toString()}`);
      setActive(prevState => !prevState);
    },
    [location.search, location.pathname, active, navigate, array, urlSearchParamName, filterFunction, useSearchParamValue]
  );

  return [toggleFilter, filteredArray, active];
};

export default useFilter;