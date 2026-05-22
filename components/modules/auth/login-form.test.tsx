import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "./login-form";

// vi.mock is hoisted — variables used directly in the factory body must be declared
// with vi.hoisted() so they exist before hoisting runs.
const { mockSignIn, mockSocialSignIn } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockSocialSignIn: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: mockSignIn,
      social: mockSocialSignIn,
    },
  },
}));

describe("LoginForm", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSignIn.mockClear();
    mockSocialSignIn.mockClear();
  });

  it("renders email and password fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
  });

  it("shows validation errors when submitting empty form", async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeTruthy();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("redirects to dashboard on successful sign-in", async () => {
    mockSignIn.mockResolvedValue({ error: null });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows root error on API failure", async () => {
    mockSignIn.mockResolvedValue({
      error: { message: "Invalid credentials" },
    });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(screen.getByText("Invalid credentials")).toBeTruthy());
    expect(mockPush).not.toHaveBeenCalled();
  });
});
