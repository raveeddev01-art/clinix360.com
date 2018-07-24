defmodule Stitch.ElasticsearchCluster do
  use Elasticsearch.Cluster, otp_app: :stitch
end
