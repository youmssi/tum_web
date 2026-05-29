import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SignupForm } from "./signup-form";
import { renderWithIntl as render } from "./test-utils";

const { mockSignUp } = vi.hoisted(() => ({
  mockSignUp: vi.fn(),
}));

const { mockToastError } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...rest }: { children: React.ReactNode } & Record<string, unknown>) => {
    const props = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return <a {...props}>{children}</a>;
  },
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signUp: { email: mockSignUp },
  },
}));

vi.mock("sonner", () => ({
  toast: { error: mockToastError, success: vi.fn() },
}));

describe("SignupForm", () => {
  beforeEach(() => {
    mockSignUp.mockClear();
    mockToastError.mockClear();
  });

  it("renders name, email, password, and confirm password fields", () => {
    render(<SignupForm />);
    expect(screen.getByLabelText(/^name/i)).toBeTruthy();
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/^password/i)).toBeTruthy();
    expect(screen.getByLabelText(/confirm password/i)).toBeTruthy();
  });

  it("shows validation errors when submitting empty form", async () => {
    render(<SignupForm />);
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeTruthy();
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("shows mismatch error when passwords do not match", async () => {
    render(<SignupForm />);
    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "alice@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "different" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeTruthy();
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("shows verification prompt after successful sign-up", async () => {
    mockSignUp.mockResolvedValue({ error: null });

    render(<SignupForm />);
    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "alice@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(screen.getByText(/check your email/i)).toBeTruthy());
  });

  it("shows toast error on API failure", async () => {
    mockSignUp.mockResolvedValue({
      error: { message: "Email already in use" },
    });

    render(<SignupForm />);
    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: "Bob" } });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "existing@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("Email already in use"));
  });
});
