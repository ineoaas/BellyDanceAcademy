import { Link } from "react-router";
import {
  ActionButton,
  ActionsCell,
  AsyncContent,
  Cell,
  PageHeader,
  Panel,
  Row,
  Table,
} from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { useSetWishlisted, useWishlist } from "../hooks";

export default function WishlistPage() {
  const wishlist = useWishlist();
  const setWishlisted = useSetWishlisted();

  return (
    <>
      <PageHeader eyebrow="Wishlist" title="Courses you're considering" />
      <Panel>
        <AsyncContent query={wishlist}>
          {(items) =>
            items.length === 0 ? (
              <p className="text-sm text-ink/55">
                Nothing saved yet.{" "}
                <Link to="/courses" className="underline">
                  Browse the catalog
                </Link>{" "}
                and save a course for later.
              </p>
            ) : (
              <Table columns={["Course", "Instructor", "Price", ""]}>
                {items.map((item) => (
                  <Row key={item.courseId}>
                    <Cell className="font-medium">
                      <Link to={`/courses/${item.courseSlug}`}>{item.courseTitle}</Link>
                    </Cell>
                    <Cell>{item.instructorName}</Cell>
                    <Cell>{formatPrice(item.priceCents)}</Cell>
                    <ActionsCell>
                      <ActionButton
                        disabled={setWishlisted.isPending}
                        onClick={() => setWishlisted.mutate({ courseId: item.courseId, wishlisted: false })}
                      >
                        Remove
                      </ActionButton>
                    </ActionsCell>
                  </Row>
                ))}
              </Table>
            )
          }
        </AsyncContent>
      </Panel>
    </>
  );
}
