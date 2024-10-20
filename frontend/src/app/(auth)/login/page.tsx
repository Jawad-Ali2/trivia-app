"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/store/AuthProvider";

const formSchema = z.object({
  username: z
    .string()
    .min(1, {
      message: "Username must be at least 5 characters.",
    })
    .toLowerCase(),
  password: z.string().min(1, {
    message: "Password must be 5 characters.",
  }),
});

export default function Login({ isOpen, onClose }) {
  const store = useAuth();
  const { setIsAuthenticated, setAccessToken, setUser } = store();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await axiosInstance.post("/auth/login", {
        username: values.username,
        password: values.password,
      });

      if (response.status === 200) {
        const data = response.data;
        console.log("Logged in successfully", data);
        setUser(data.user);
        setAccessToken(data.accessToken);
        setIsAuthenticated(true);
        localStorage.setItem("accessToken", data.accessToken);
        onClose(); // Close modal on successful login
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <h1 className="text-5xl font-black text-center m-10 ml-4 text-indigo-600">
          Sign In
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your username"
                      {...field}
                      className="bg-white text-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                      className="bg-white text-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition-all"
            >
              Submit
            </Button>
          </form>
        </Form>
      </Modal>
    </>
  );
}
