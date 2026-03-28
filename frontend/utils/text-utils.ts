export const formatValuesRemoveUnderscores = (value: string) =>
    value
      .split("_")
      .map((word) =>
        word === "and" ? word : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join(" ");
