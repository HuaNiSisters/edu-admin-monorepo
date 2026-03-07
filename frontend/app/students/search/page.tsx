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

const SearchStudentPage = () => {
  const [searchInput, setSearchInput] = useState("");

  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
    const result = await apiWrapper.searchAsync(event.target.value);
    setSearchResults(result || []);
  };

  return (
    <div className="">
      <InputGroup>
        <InputGroupInput
          placeholder="Search by Mobile, First Name, Last Name and Email"
          // value={searchInput}
          onChange={handleSearch}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>

      <div>{searchInput}</div>

      <table>
        <thead>
          <th>First Name</th>
          <th>Last Name</th>
        </thead>
        <tbody>
          {searchResults.map((result, index) => (
            <tr key={index}>
              <td>{result.firstName}</td>
              <td>{result.lastName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SearchStudentPage;
