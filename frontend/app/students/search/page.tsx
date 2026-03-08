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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchStudentsResponse } from "@/types/IApiWrapper";
import { useRouter } from "next/navigation";

const SearchStudentPage = () => {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");

  const [searchResults, setSearchResults] = useState<SearchStudentsResponse>(
    [],
  );
  const { run, isPending } = useAsync();

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
    if (event.target.value.length < 4) return;
    const handleQuery = async () => {
      const result = await apiWrapper.searchStudentsAsync(event.target.value);
      setSearchResults(result || []);
    };
    run(handleQuery);
  };

  const onClickRow = (studentId: string) => {
    router.replace(`/student/${studentId}`);
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

      {!searchInput && <div></div>}
      {!!searchInput && isPending && <div>Loading...</div>}
      {!!searchInput && !isPending && searchResults.length === 0 && (
        <div>No results found for "{searchInput}"</div>
      )}

      {!!searchInput && !isPending && searchResults.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Contacts</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {searchResults.map((result, index) => (
              <TableRow
                key={result.student_id}
                onClick={() => onClickRow(result.student_id)}
                style={{ cursor: "pointer" }}
              >
                <TableCell>{result.first_name}</TableCell>
                <TableCell>{result.last_name}</TableCell>
                <TableCell>
                  <div>Student: {result.student_mobile}</div>
                  <div>
                    {result.parents.map((parent) => (
                      <div key={parent.parent_id}>
                        {`${parent.first_name}: ${parent.parent_mobile}`}
                      </div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default SearchStudentPage;
