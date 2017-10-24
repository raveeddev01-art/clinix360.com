defmodule Stitch.Repo.Migrations.AddSubscriptionLineItemIdToSubscriptions do
  use Ecto.Migration

  def change do
    alter table(:subscriptions) do
      add :subscription_line_item_id, :string
    end
  end
end
