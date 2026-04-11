"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateGroupPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!session) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Create Group</h1>
          <p className="text-gray-400 mb-6">Please sign in to create a group</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/groups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/groups/${data.groupId}`);
      } else {
        setError(data.error || "Failed to create group");
      }
    } catch (err) {
      setError("An error occurred while creating the group");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
      <div className="bg-neutral-800 rounded-lg p-8 max-w-md w-full border border-neutral-700">
        <h1 className="text-3xl font-bold mb-6">Create Group</h1>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Group Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={255}
              placeholder="Enter group name"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={1000}
              placeholder="Describe your group (optional)"
              rows={4}
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
          >
            {isLoading ? "Creating..." : "Create Group"}
          </button>
        </form>

        <Link href="/groups" className="text-blue-400 hover:text-blue-300 text-sm mt-4 inline-block">
          Back to Groups
        </Link>
      </div>
    </div>
  );
}
