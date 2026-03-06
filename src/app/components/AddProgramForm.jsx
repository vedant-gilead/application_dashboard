import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus } from "lucide-react";
import programData from "../../data/Program_Details.json";
import sitesMasterData from "../../data/sitesMasterData.json";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

export default function AddProgramForm({ onAddProgram }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({});

    // Initialize form data with empty strings for all columns
    useEffect(() => {
        const initialData = {};
        programData.columns.forEach((col) => {
            initialData[col.key] = "";
        });
        setFormData(initialData);
    }, [open]); // Re-initialize when dialog opens

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => {
            const newData = { ...prev, [name]: value };

            // Find the selected site's data
            const siteData = sitesMasterData.data.find(
                (site) => site.execution_site === value
            );

            // Auto-populate lead times if a site is selected
            if (siteData) {
                if (name === "apiSite") {
                    newData.apiSiteReceivingLeadTime = siteData.receiving_lead_time;
                    newData.apiSiteManufacturingLeadTime = siteData.manufacturing_lead_time;
                    newData.apiSiteReleaseLeadTime = siteData.release_lead_time;
                } else if (name === "dsSite") {
                    newData.dsSiteReceivingLeadTime = siteData.receiving_lead_time;
                    newData.dsSiteManufacturingLeadTime = siteData.manufacturing_lead_time;
                    newData.dsSiteReleaseLeadTime = siteData.release_lead_time;
                } else if (name === "dpSite") {
                    newData.dpSiteReceivingLeadTime = siteData.receiving_lead_time;
                    newData.dpSiteManufacturingLeadTime = siteData.manufacturing_lead_time;
                    newData.dpSiteReleaseLeadTime = siteData.release_lead_time;
                } else if (name === "labelSite") {
                    newData.labelSiteReceivingLeadTime = siteData.receiving_lead_time;
                    newData.labelSiteManufacturingLeadTime = siteData.manufacturing_lead_time;
                    newData.labelSiteReleaseLeadTime = siteData.release_lead_time;
                }
            } else {
                 // Clear lead times if no site is selected (or if it's somehow cleared)
                 if (name === "apiSite") {
                    newData.apiSiteReceivingLeadTime = "";
                    newData.apiSiteManufacturingLeadTime = "";
                    newData.apiSiteReleaseLeadTime = "";
                } else if (name === "dsSite") {
                    newData.dsSiteReceivingLeadTime = "";
                    newData.dsSiteManufacturingLeadTime = "";
                    newData.dsSiteReleaseLeadTime = "";
                } else if (name === "dpSite") {
                    newData.dpSiteReceivingLeadTime = "";
                    newData.dpSiteManufacturingLeadTime = "";
                    newData.dpSiteReleaseLeadTime = "";
                } else if (name === "labelSite") {
                    newData.labelSiteReceivingLeadTime = "";
                    newData.labelSiteManufacturingLeadTime = "";
                    newData.labelSiteReleaseLeadTime = "";
                }
            }

            return newData;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Use the managed state instead of FormData directly
        const newProgram = { ...formData };

        // Simulate API call
        setTimeout(() => {
            console.log("Submitting to API:", newProgram);
            onAddProgram(newProgram);
            setIsSubmitting(false);
            setOpen(false);
            toast.success("Program added successfully!");
        }, 1000);
    };

    const isReadOnlyLeadTime = (key) => {
        return [
            "apiSiteReceivingLeadTime",
            "apiSiteManufacturingLeadTime",
            "apiSiteReleaseLeadTime",
            "dsSiteReceivingLeadTime",
            "dsSiteManufacturingLeadTime",
            "dsSiteReleaseLeadTime",
            "dpSiteReceivingLeadTime",
            "dpSiteManufacturingLeadTime",
            "dpSiteReleaseLeadTime",
            "labelSiteReceivingLeadTime",
            "labelSiteManufacturingLeadTime",
            "labelSiteReleaseLeadTime",
        ].includes(key);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#306e9a] text-white px-4 py-2 rounded-lg shadow hover:bg-[#245371] transition-colors flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Program
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-[700px] bg-white rounded-lg shadow-xl overflow-hidden p-0 border-0">
                <DialogHeader className="px-6 py-4 border-b border-gray-200 bg-white">
                    <DialogTitle className="text-xl font-semibold text-gray-800">Add New Program</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 mt-1">
                        Fill in the details below to add a new program to the system.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[65vh] px-2 py-2 mx-4 my-2">
                    <form id="add-program-form" onSubmit={handleSubmit} className="px-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            {programData.columns.map((column) => {
                                const isSiteDropdown = ["apiSite", "dsSite", "dpSite", "labelSite"].includes(column.key);
                                const isReadOnly = isReadOnlyLeadTime(column.key);

                                return (
                                    <div className="space-y-1.5" key={column.key}>
                                        <Label htmlFor={column.key} className="text-sm font-medium text-gray-700 block">
                                            {column.label}
                                        </Label>
                                        
                                        {isSiteDropdown ? (
                                            <Select
                                                value={formData[column.key]}
                                                onValueChange={(value) => handleSelectChange(column.key, value)}
                                            >
                                                <SelectTrigger className="w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#306e9a]/20 focus:border-[#306e9a] bg-white sm:text-sm h-9 px-3 py-2 transition-all duration-200 outline-none">
                                                    <SelectValue placeholder={`Select ${column.label}`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sitesMasterData.data.map((site) => (
                                                        <SelectItem key={site.execution_site} value={site.execution_site}>
                                                            {site.execution_site}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                id={column.key}
                                                name={column.key}
                                                value={formData[column.key] || ""}
                                                onChange={handleChange}
                                                readOnly={isReadOnly}
                                                className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#306e9a]/20 focus:border-[#306e9a] bg-white sm:text-sm h-9 px-3 py-2 transition-all duration-200 outline-none ${isReadOnly ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                                                placeholder={`Enter ${column.label}`}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </form>
                </ScrollArea>
                <DialogFooter className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting} className="h-9 px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-100 bg-white">
                        Cancel
                    </Button>
                    <Button type="submit" form="add-program-form" className="h-9 bg-[#306e9a] text-white hover:bg-[#245371] px-4 py-2 shadow-sm" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Program"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}