import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SignupForm } from "./signup-form";

// vi.mock is hoisted — variables used directly in the factory body must be declared
// with vi.hoisted() so they exist before hoisting runs.
const { mockSignUp } = vi.hoisted(() => ({
  mockSignUp: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signUp: { email: mockSignUp },
  },
}));

describe("SignupForm", () => {
  beforeEach(() => {
    mockSignUp.mockClear();
  });

  it("renders name, email, and password fields", () => {
    render(<SignupForm />);
    expect(screen.getByLabelText(/^name/i)).toBeTruthy();
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
  });

  it("shows validation errors when submitting empty form", async () => {
    render(<SignupForm />);
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeTruthy();
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("shows verification prompt after successful sign-up", async () => {
    mockSignUp.mockResolvedValue({ error: null });

    render(<SignupForm />);
    fireEvent.change(screen.getByLabelText(/^name/i), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "alice@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(screen.getByText(/check your email/i)).toBeTruthy());
  });

  it("shows root error on API failure", async () => {
    mockSignUp.mockResolvedValue({
      error: { message: "Email already in use" },
    });

    render(<SignupForm />);
    fireEvent.change(screen.getByLabelText(/^name/i), {
      target: { value: "Bob" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "existing@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(screen.getByText("Email already in use")).toBeTruthy());
  });
});
