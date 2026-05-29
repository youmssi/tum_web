import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "./login-form";
import { renderWithIntl as render } from "./test-utils";

const { mockSignIn, mockSocialSignIn } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockSocialSignIn: vi.fn(),
}));

const { mockToastError } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
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

vi.mock("sonner", () => ({
  toast: { error: mockToastError, success: vi.fn() },
}));

describe("LoginForm", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSignIn.mockClear();
    mockSocialSignIn.mockClear();
    mockToastError.mockClear();
  });

  it("renders email and password fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
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
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows toast error on API failure", async () => {
    mockSignIn.mockResolvedValue({
      error: { message: "Invalid credentials" },
    });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("Invalid credentials"));
    expect(mockPush).not.toHaveBeenCalled();
  });
});
