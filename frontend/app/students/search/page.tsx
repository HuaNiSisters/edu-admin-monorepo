"use client";

import { useState } from "react";
import { SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import apiWrapper from "@/lib/apiWrapper";
import { useAsync } from "@/hooks/use-async";

const SearchStudentPage = () => {
  const [searchInput, setSearchInput] = useState("");

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { run, isPending } = useAsync();

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
    if (searchInput.length < 4) return;
    const handleQuery = async () => {
      const result = await apiWrapper.searchAsync(event.target.value);
      setSearchResults(result || []);
    };
    run(handleQuery);
  };

  return (
    <div className="">
      <InputGroup>
        <InputGroupInput
          placeholder="Search by Mobile, First Name, Last Name and Email"
          value={searchInput}
          onChange={onChange}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>

      <div>{searchInput}</div>

      {!searchInput && <div></div>}
      {!!searchInput && isPending && <div>Loading...</div>}
      {!!searchInput && !isPending && searchResults.length === 0 && (
        <div>No results found for "{searchInput}"</div>
      )}

      {!!searchInput && !isPending && searchResults.length > 0 && (
        <table>
          <thead>
            <th>First Name</th>
            <th>Last Name</th>
          </thead>
          <tbody>
            {searchResults.map((result, index) => (
              <tr key={index}>
                <td>{result.first_name}</td>
                <td>{result.last_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SearchStudentPage;
