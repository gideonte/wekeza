"use client";

import type React from "react";

import { useState } from "react";
import {
  Download,
  FileText,
  Plus,
  Search,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Import the api from Convex
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory] = useState("all");
  const [currentTab, setCurrentTab] = useState("all");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFormData, setUploadFormData] = useState({
    category: "",
    description: "",
    isPublished: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data from Convex
  const documents =
    useQuery(api.documents.getPublishedDocuments, {
      category: selectedCategory !== "all" ? selectedCategory : undefined,
    }) || [];

  // Get my documents (for showing actions)
  const myDocuments = useQuery(api.documents.getMyDocuments) || [];

  // Get current user
  const currentUser = useQuery(api.users.current);

  // Check if the current user can upload documents
  const canUpload = useQuery(api.users.canUploadDocuments) || false;

  // Check if user is admin
  const isAdmin = useQuery(api.users.isAdmin) || false;

  // Mutations
  const updateVisibility = useMutation(api.documents.updateDocumentVisibility);
  const deleteDocument = useMutation(api.documents.deleteDocument);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const uploadDocument = useMutation(api.documents.uploadDocument);

  // Filter documents based on search query
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description &&
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUploadFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle document upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setIsSubmitting(true);

    try {
      // 1. Get a URL to upload the file to
      const uploadUrl = await generateUploadUrl();

      // 2. Upload the file to the URL
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": uploadFile.type,
        },
        body: uploadFile,
      });

      if (!result.ok) {
        throw new Error("Failed to upload file");
      }

      // 3. Get the storageId from the response
      const { storageId } = await result.json();

      // 4. Create the document in the database
      await uploadDocument({
        name: uploadFile.name,
        type: uploadFile.type,
        size: uploadFile.size,
        fileId: storageId,
        category: uploadFormData.category || "Uncategorized",
        description: uploadFormData.description,
        isPublished: uploadFormData.isPublished,
      });

      // 5. Show success message
      toast.success("Document uploaded", {
        description: "Your document has been uploaded successfully",
      });

      // 6. Reset form
      setUploadFile(null);
      setUploadFormData({
        category: "",
        description: "",
        isPublished: true,
      });

      // Close the dialog by simulating Escape key press
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed", {
        description: "There was an error uploading your document",
      });
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  };

  // Handle document deletion
  const handleDelete = async (documentId: Id<"documents">) => {
    try {
      await deleteDocument({
        documentId,
      });

      toast.success("Document deleted", {
        description: "The document has been deleted successfully",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete failed", {
        description: "There was an error deleting the document",
      });
    }
  };

  // Handle visibility toggle
  const handleVisibilityToggle = async (
    documentId: Id<"documents">,
    currentVisibility: boolean
  ) => {
    try {
      await updateVisibility({
        documentId,
        isPublished: !currentVisibility,
      });

      toast.success("Visibility updated", {
        description: `Document is now ${!currentVisibility ? "published" : "unpublished"}`,
      });
    } catch (error) {
      console.error("Visibility update error:", error);
      toast.error("Update failed", {
        description: "There was an error updating the document visibility",
      });
    }
  };

  // Check if a document is owned by the current user or if user is admin
  const canManageDocument = (docId: Id<"documents">) => {
    return (
      myDocuments.some((doc) => doc._id === docId) ||
      currentUser?.role === "admin"
    );
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Render document table
  const renderDocumentTable = (docs: any[]) => {
    if (!docs || docs.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          No documents found.
        </div>
      );
    }

    return (
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Name
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Category
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">
                Size
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">
                Date
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {docs.map((doc) => (
              <tr
                key={doc._id}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{doc.name}</span>
                    {!doc.isPublished && (
                      <Badge variant="outline" className="ml-2">
                        Draft
                      </Badge>
                    )}
                  </div>
                  {doc.description && (
                    <p className="text-xs text-muted-foreground mt-1 max-w-md truncate">
                      {doc.description}
                    </p>
                  )}
                </td>
                <td className="p-4 align-middle">
                  <Badge variant="secondary">{doc.category}</Badge>
                </td>
                <td className="p-4 align-middle hidden md:table-cell">
                  {formatFileSize(doc.size)}
                </td>
                <td className="p-4 align-middle hidden md:table-cell">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-2">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" title="Download">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </a>

                    {canManageDocument(doc._id) && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={doc.isPublished ? "Unpublish" : "Publish"}
                          onClick={() =>
                            handleVisibilityToggle(doc._id, doc.isPublished)
                          }
                        >
                          {doc.isPublished ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {doc.isPublished ? "Unpublish" : "Publish"}
                          </span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete"
                          onClick={() => handleDelete(doc._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Admin tools button */}
          {isAdmin && (
            <Link href="/dashboard/admin/upload-manual">
              <Button variant="outline" size="icon" title="Admin Tools">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Admin Tools</span>
              </Button>
            </Link>
          )}

          {/* Only show upload button for users with upload permission */}
          {canUpload && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Upload a new document to your document storage.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpload}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="file">File</Label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              PDF, DOCX, XLSX, PPTX (MAX. 10MB)
                            </p>
                          </div>
                          <input
                            id="file"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      {uploadFile && (
                        <p className="text-sm text-green-600">
                          Selected: {uploadFile.name} (
                          {formatFileSize(uploadFile.size)})
                        </p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        placeholder="e.g., Financial, Agreements, Tax"
                        value={uploadFormData.category}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">
                        Description (Optional)
                      </Label>
                      <Input
                        id="description"
                        placeholder="Brief description of the document"
                        value={uploadFormData.description}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isUploading || !uploadFile}>
                      {isSubmitting ? "Uploading..." : "Upload Document"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {!canUpload && documents.length > 0 && (
        <div className="text-sm text-muted-foreground mb-4">
          <p>
            Only authorized users can upload documents. Contact an administrator
            if you need to add a document.
          </p>
        </div>
      )}

      <Tabs
        defaultValue="all"
        className="space-y-4"
        value={currentTab}
        onValueChange={setCurrentTab}
      >
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="agreements">Agreements</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {documents ? (
                renderDocumentTable(filteredDocuments)
              ) : (
                <div className="p-8">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {documents ? (
                renderDocumentTable(
                  filteredDocuments.filter(
                    (doc) => doc.category === "Financial"
                  )
                )
              ) : (
                <div className="p-8">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="agreements" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {documents ? (
                renderDocumentTable(
                  filteredDocuments.filter(
                    (doc) => doc.category === "Agreements"
                  )
                )
              ) : (
                <div className="p-8">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {documents ? (
                renderDocumentTable(
                  filteredDocuments.filter((doc) => doc.category === "Meetings")
                )
              ) : (
                <div className="p-8">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
