"use client";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import {
  FormControl,
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

interface SignupProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  username: z
    .string()
    .min(5, { message: "Username must be at least 5 characters." })
    .toLowerCase(),
  email: z
    .string()
    .email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(5, { message: "Password must be at least 5 characters." }),
  confirmPassword: z
    .string()
    .min(5, { message: "Password must be at least 5 characters." }),
});

function Signup({ isOpen, onClose }: SignupProps) {
  const store = useAuth();
  const { setIsAuthenticated, setAccessToken, setUser } = store();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await axiosInstance.post("/auth/register", {
        username: values.username,
        email: values.email,
        password: values.password,
        confirmPassword: values.password,
      });

      if (response.status === 200) {
        const data = response.data;
        console.log("Signed up successfully", data);
        setUser(data.user);
        setAccessToken(data.accessToken);
        setIsAuthenticated(true);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        onClose(); // Close modal on successful sign-up
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h1 className="text-5xl font-black text-center m-10 ml-4 text-indigo-600">
        Sign Up
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
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
            Sign Up
          </Button>
        </form>
      </Form>
    </Modal>
  );
}

export default Signup;
