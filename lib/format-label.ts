export const formatFieldName = (key: string) =>
    key
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
export const formatFieldList = (fields: string[], limit: number) => {
    const mapped = fields.map(formatFieldName);
    const visible = mapped.slice(0, limit);
    const remaining = mapped.length - visible.length;
    return remaining > 0
        ? `${visible.join(", ")} +${remaining}`
        : visible.join(", ");
};

export const createEmptyApplicationData = () => ({
    brand_name: "",
    class_type_designation: "",
    alcohol_content: "",
    net_contents: "",
    producer_name: "",
    producer_address: "",
    country_of_origin: "",
    gov_warning: "",
});
