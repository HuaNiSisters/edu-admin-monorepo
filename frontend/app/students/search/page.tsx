"use client";

import { useState } from "react";
import { SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import apiWrapper from "@/lib/apiWrapper";
import { useAsync } from "@/hooks/use-async";
import { SearchStudentsResponse } from "@/types/IApiWrapper";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { LoadingBar } from "@/components/loading-bar";

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
      <LoadingBar isLoading={isPending} />

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

      {!!searchInput && !isPending && searchResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
            <SearchIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-base font-medium text-foreground">
            No results found for &quot;{searchInput}&quot;
          </p>
        </div>
      )}

      <div className="py-4">
        {!!searchInput && !isPending && searchResults.length > 0 && (
          <DataTable
            columns={columns}
            data={searchResults}
            onRowClick={(row) => onClickRow(row.student_id)}
          />
        )}
      </div>
    </div>
  );
};

export default SearchStudentPage;
