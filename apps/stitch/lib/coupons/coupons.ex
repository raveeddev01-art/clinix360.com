defmodule Stitch.Coupons do
  @moduledoc """
  The Coupons context.
  """

  import Ecto.Query, warn: false
  alias Stitch.Repo

  alias Stitch.Coupons.SignupCoupon

  @doc """
  Returns the list of signup_coupons.

  ## Examples

      iex> list_signup_coupons()
      [%SignupCoupon{}, ...]

  """
  def list_signup_coupons do
    Repo.all(SignupCoupon)
  end

  @doc """
  Gets a single signup_coupon.

  Raises `Ecto.NoResultsError` if the Signup coupon does not exist.

  ## Examples

      iex> get_signup_coupon!(123)
      %SignupCoupon{}

      iex> get_signup_coupon!(456)
      ** (Ecto.NoResultsError)

  """
  def get_signup_coupon!(id), do: Repo.get!(SignupCoupon, id)

  @doc """
  Creates a signup_coupon.

  ## Examples

      iex> create_signup_coupon(%{field: value})
      {:ok, %SignupCoupon{}}

      iex> create_signup_coupon(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_signup_coupon(attrs \\ %{}) do
    %SignupCoupon{}
    |> SignupCoupon.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a signup_coupon.

  ## Examples

      iex> update_signup_coupon(signup_coupon, %{field: new_value})
      {:ok, %SignupCoupon{}}

      iex> update_signup_coupon(signup_coupon, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_signup_coupon(%SignupCoupon{} = signup_coupon, attrs) do
    signup_coupon
    |> SignupCoupon.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a SignupCoupon.

  ## Examples

      iex> delete_signup_coupon(signup_coupon)
      {:ok, %SignupCoupon{}}

      iex> delete_signup_coupon(signup_coupon)
      {:error, %Ecto.Changeset{}}

  """
  def delete_signup_coupon(%SignupCoupon{} = signup_coupon) do
    Repo.delete(signup_coupon)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking signup_coupon changes.

  ## Examples

      iex> change_signup_coupon(signup_coupon)
      %Ecto.Changeset{source: %SignupCoupon{}}

  """
  def change_signup_coupon(%SignupCoupon{} = signup_coupon) do
    SignupCoupon.changeset(signup_coupon, %{})
  end

  def get_coupon_by_code(code) do
    Repo.get_by(SignupCoupon, [code: code])
  end

  def update_signup_coupon(%{code: code} = params) do
    params = Map.drop(params, [:code])

    get_coupon_by_code(code)
    |> update_signup_coupon(params)
  end

  def validate_coupon_code(code) do
    get_coupon_by_code(code)
    |> parse_coupon_code_response()
  end

  defp parse_coupon_code_response(nil), do: :invalid_coupon_code
  defp parse_coupon_code_response(%SignupCoupon{} = signup_coupon) when signup_coupon.is_used, do: :coupon_already_used
  defp parse_coupon_code_response(%SignupCoupon{}), do: :valid_coupon_code


end
